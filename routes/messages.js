// messages.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Use the same secret as before (in production, store this securely)
const secret = process.env.JWT_SECRET || 'your_secret_key';

// Middleware to verify JWT for logged-in users
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Please login first.' });
        }
        req.user = decoded;
        next();
    });
}

// POST /api/messages - Endpoint for a user to send a message to admin
router.post('/messages', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    const { message_text } = req.body;

    if (!message_text) {
        return res.status(400).json({ error: 'Message text is required.' });
    }

    const sentAt = new Date().toISOString();

    try {
        // Insert the message
        await db.execute(
            'INSERT INTO Messages (user_id, message_text, sent_at) VALUES (?, ?, ?)',
            [userId, message_text, sentAt]
        );

        // Retrieve the last inserted ID
        const idResult = await db.execute('SELECT last_insert_rowid() AS id');
        const messageId = idResult.rows[0].id;

        res.json({ message: 'Message sent successfully.', messageId });
    } catch (err) {
        console.error('Error inserting message:', err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// GET /api/admin/messages - Admin retrieves all user messages
router.get('/admin/messages', verifyToken, async (req, res) => {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }

    try {
        const { rows } = await db.execute(
            `SELECT m.id, m.message_text, m.sent_at, u.name, u.email
       FROM Messages m
       JOIN Users u ON m.user_id = u.id
       ORDER BY m.sent_at DESC`,
            []
        );
        res.json(rows);
    } catch (err) {
        console.error('Error retrieving messages:', err);
        res.status(500).json({ error: 'Database error.' });
    }
});

module.exports = router;











//const express = require('express');
//const router = express.Router();
//const db = require('../db');
//const jwt = require('jsonwebtoken');

//// Use the same secret as before (in production, store this securely)
//const secret = 'your_secret_key';

//// Middleware to verify JWT for logged-in users
//function verifyToken(req, res, next) {
//    const authHeader = req.headers['authorization'];
//    if (!authHeader) {
//        return res.status(401).json({ error: 'No token provided.' });
//    }
//    const token = authHeader.split(' ')[1];
//    if (!token) {
//        return res.status(401).json({ error: 'No token provided.' });
//    }
//    jwt.verify(token, secret, (err, decoded) => {
//        if (err) {
//            return res.status(401).json({ error: 'Please login first' });
//        }
//        req.user = decoded;
//        next();
//    });
//}

//// POST /api/messages - Endpoint for a user to send a message to admin
//router.post('/messages', verifyToken, (req, res) => {
//    const userId = req.user.userId;
//    const { message_text } = req.body;

//    if (!message_text) {
//        return res.status(400).json({ error: 'Message text is required.' });
//    }

//    const sent_at = new Date().toISOString();
//    db.run(
//        'INSERT INTO Messages (user_id, message_text, sent_at) VALUES (?, ?, ?)',
//        [userId, message_text, sent_at],
//        function (err) {
//            if (err) {
//                console.error('Error inserting message:', err);
//                return res.status(500).json({ error: 'Database error.' });
//            }
//            res.json({ message: 'Message sent successfully.', messageId: this.lastID });
//        }
//    );
//});

//// GET /api/admin/messages - Admin retrieves all user messages
//router.get('/admin/messages', verifyToken, (req, res) => {
//    // Check if the user is an admin
//    if (req.user.role !== 'admin') {
//        return res.status(403).json({ error: 'Admin access required.' });
//    }

//    // Join Messages with Users table to get sender details
//    db.all(
//        `SELECT m.id, m.message_text, m.sent_at, u.name, u.email 
//     FROM Messages m 
//     JOIN Users u ON m.user_id = u.id
//     ORDER BY m.sent_at DESC`,
//        [],
//        (err, rows) => {
//            if (err) {
//                console.error('Error retrieving messages:', err);
//                return res.status(500).json({ error: 'Database error.' });
//            }
//            res.json(rows);
//        }
//    );
//});

//module.exports = router;
