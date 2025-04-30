const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// In production, store your secret in an environment variable
const secret = process.env.JWT_SECRET || 'your_secret_key';

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage });

// Middleware to verify admin access
function verifyAdmin(req, res, next) {
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
            return res.status(401).json({ error: 'Failed to authenticate token.' });
        }
        req.user = decoded;
        next();
    });
}

// GET /api/admin/products - Retrieve all products (for admin view)
router.get('/admin/products', verifyAdmin, async (req, res) => {
    try {
        const { rows } = await db.execute('SELECT * FROM Products');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// POST /api/admin/products - Add a new product
router.post('/admin/products', verifyAdmin, upload.single('image'), async (req, res) => {
    const { name, description, price, stock } = req.body;
    if (!name || !price || !stock) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    const imagePath = req.file ? 'uploads/' + req.file.filename : null;
    try {
        await db.execute(
            'INSERT INTO Products (name, description, price, stock, imagePath) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, stock, imagePath]
        );
        res.json({ message: 'Product added successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// PUT /api/admin/products/:id - Update a product
router.put('/admin/products/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, stock } = req.body;
    let imagePath;
    if (req.file) {
        imagePath = 'uploads/' + req.file.filename;
    }
    try {
        if (imagePath) {
            await db.execute(
                'UPDATE Products SET name = ?, description = ?, price = ?, stock = ?, imagePath = ? WHERE id = ?',
                [name, description, price, stock, imagePath, productId]
            );
        } else {
            await db.execute(
                'UPDATE Products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
                [name, description, price, stock, productId]
            );
        }
        res.json({ message: 'Product updated successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// DELETE /api/admin/products/:id - Delete a product
router.delete('/admin/products/:id', verifyAdmin, async (req, res) => {
    const productId = req.params.id;
    try {
        await db.execute('DELETE FROM Products WHERE id = ?', [productId]);
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error.' });
    }
});

module.exports = router;










//const express = require('express');
//const router = express.Router();
//const db = require('../db');
//const jwt = require('jsonwebtoken');
//const multer = require('multer');
//const path = require('path');

//// In production, store your secret in an environment variable.
//const secret = 'your_secret_key';

//// Configure Multer for image uploads
//const storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//        cb(null, path.join(__dirname, '../public/uploads'));
//    },
//    filename: function (req, file, cb) {
//        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//        const ext = path.extname(file.originalname);
//        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//    }
//});
//const upload = multer({ storage: storage });

//// Middleware to verify admin access
//function verifyAdmin(req, res, next) {
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
//            return res.status(401).json({ error: 'Failed to authenticate token.' });
//        }
//        if (decoded.role !== 'admin') {
//            return res.status(403).json({ error: 'Admin access required.' });
//        }
//        req.user = decoded;
//        next();
//    });
//}

//// GET /api/admin/products - Retrieve all products (for admin view)
//router.get('/admin/products', verifyAdmin, (req, res) => {
//    db.all('SELECT * FROM Products', [], (err, rows) => {
//        if (err) {
//            console.error(err);
//            return res.status(500).json({ error: 'Database error.' });
//        }
//        res.json(rows);
//    });
//});

//// POST /api/admin/products - Add a new product
//router.post('/admin/products', verifyAdmin, upload.single('image'), (req, res) => {
//    const { name, description, price, stock } = req.body;
//    const imagePath = req.file ? 'uploads/' + req.file.filename : null;
//    if (!name || !price || !stock) {
//        return res.status(400).json({ error: 'Missing required fields.' });
//    }
//    db.run(
//        'INSERT INTO Products (name, description, price, stock, imagePath) VALUES (?, ?, ?, ?, ?)',
//        [name, description, price, stock, imagePath],
//        function (err) {
//            if (err) {
//                console.error(err);
//                return res.status(500).json({ error: 'Database error.' });
//            }
//            res.json({ message: 'Product added successfully.', productId: this.lastID });
//        }
//    );
//});

//// PUT /api/admin/products/:id - Update a product
//router.put('/admin/products/:id', verifyAdmin, upload.single('image'), (req, res) => {
//    const productId = req.params.id;
//    const { name, description, price, stock } = req.body;
//    let imagePath;
//    if (req.file) {
//        imagePath = 'uploads/' + req.file.filename;
//    }
//    if (imagePath) {
//        db.run(
//            'UPDATE Products SET name = ?, description = ?, price = ?, stock = ?, imagePath = ? WHERE id = ?',
//            [name, description, price, stock, imagePath, productId],
//            function (err) {
//                if (err) {
//                    console.error(err);
//                    return res.status(500).json({ error: 'Database error.' });
//                }
//                res.json({ message: 'Product updated successfully.' });
//            }
//        );
//    } else {
//        db.run(
//            'UPDATE Products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
//            [name, description, price, stock, productId],
//            function (err) {
//                if (err) {
//                    console.error(err);
//                    return res.status(500).json({ error: 'Database error.' });
//                }
//                res.json({ message: 'Product updated successfully.' });
//            }
//        );
//    }
//});

//// DELETE /api/admin/products/:id - Delete a product
//router.delete('/admin/products/:id', verifyAdmin, (req, res) => {
//    const productId = req.params.id;
//    db.run(
//        'DELETE FROM Products WHERE id = ?',
//        [productId],
//        function (err) {
//            if (err) {
//                console.error(err);
//                return res.status(500).json({ error: 'Database error.' });
//            }
//            res.json({ message: 'Product deleted successfully.' });
//        }
//    );
//});

//module.exports = router;
