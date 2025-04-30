// auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// In production, store your secret in an environment variable
const secret = process.env.JWT_SECRET || 'your_secret_key';

// User Registration Route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    try {
        // Check if the email already exists
        const existing = await db.execute(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists.' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the database (role defaults to 'user')
        await db.execute(
            'INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        // Retrieve the new user's id
        const idResult = await db.execute('SELECT last_insert_rowid() AS id');
        const userId = idResult.rows[0].id;

        res.json({ message: 'User registered successfully!', userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// User Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
    }

    try {
        // Fetch the user from the database
        const result = await db.execute(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );
        const users = result.rows;
        if (users.length === 0) {
            return res.status(400).json({ error: 'User not found.' });
        }
        const user = users[0];

        // Compare the provided password with the stored hash
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(400).json({ error: 'Incorrect password.' });
        }

        // Generate a JWT token that expires in 1 hour
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            secret,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful!', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error.' });
    }
});

module.exports = router;

















//const express = require('express');
//const router = express.Router();
//const db = require('../db');
//const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');

//// In a real project, store your secret in an environment variable.
//const secret = 'your_secret_key';

//// User Registration Route
//router.post('/register', async (req, res) => {
//    const { name, email, password } = req.body;

//    // Basic validation
//    if (!name || !email || !password) {
//        return res.status(400).json({ error: 'Please provide name, email, and password.' });
//    }

//    try {
//        // Check if the email already exists
//        db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, row) => {
//            if (err) {
//                console.error(err);
//                return res.status(500).json({ error: 'Database error.' });
//            }
//            if (row) {
//                return res.status(400).json({ error: 'Email already exists.' });
//            }

//            // Hash the password
//            const saltRounds = 10;
//            const hashedPassword = await bcrypt.hash(password, saltRounds);

//            // Insert the new user into the database (role defaults to 'user')
//            db.run('INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)',
//                [name, email, hashedPassword], function (err) {
//                    if (err) {
//                        console.error(err);
//                        return res.status(500).json({ error: 'Database error during insertion.' });
//                    }
//                    res.json({ message: 'User registered successfully!', userId: this.lastID });
//                });
//        });
//    } catch (error) {
//        console.error(error);
//        res.status(500).json({ error: 'Server error.' });
//    }
//});

//// User Login Route
//router.post('/login', (req, res) => {
//    const { email, password } = req.body;

//    // Basic validation
//    if (!email || !password) {
//        return res.status(400).json({ error: 'Please provide email and password.' });
//    }

//    // Fetch the user from the database
//    db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
//        if (err) {
//            console.error(err);
//            return res.status(500).json({ error: 'Database error.' });
//        }
//        if (!user) {
//            return res.status(400).json({ error: 'User not found.' });
//        }

//        // Compare the provided password with the stored hash
//        const match = await bcrypt.compare(password, user.password_hash);
//        if (!match) {
//            return res.status(400).json({ error: 'Incorrect password.' });
//        }

//        // Generate a JWT token that expires in 1 hour
//        const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '1h' });

//        res.json({ message: 'Login successful!', token });
//    });
//});

//module.exports = router;
