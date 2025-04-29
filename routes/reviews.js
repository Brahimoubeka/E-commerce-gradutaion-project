const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const secret = 'your_secret_key';

// JWT verification middleware (same as before)
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token invalid.' });
        req.user = decoded;
        next();
    });
}

// GET /api/products/:id/reviews - Get reviews for a specific product
router.get('/products/:id/reviews', (req, res) => {
    const productId = req.params.id;
    const query = `
    SELECT r.*, u.name AS userName 
    FROM Reviews r 
    JOIN Users u ON r.user_id = u.id 
    WHERE product_id = ? 
    ORDER BY created_at DESC
  `;
    db.all(query, [productId], (err, rows) => {
        if (err) {
            console.error('Error retrieving reviews:', err);
            return res.status(500).json({ error: 'Database error retrieving reviews.' });
        }
        res.json(rows);
    });
});

// POST /api/reviews - Add a new review (requires login)
router.post('/reviews', verifyToken, (req, res) => {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.userId;
    const created_at = new Date().toISOString();

    if (!product_id || !rating) {
        return res.status(400).json({ error: 'Product ID and rating are required.' });
    }

    db.run(
        `INSERT INTO Reviews (product_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)`,
        [product_id, user_id, rating, comment || '', created_at],
        function (err) {
            if (err) {
                console.error('Error inserting review:', err);
                return res.status(500).json({ error: 'Database error adding review.' });
            }
            res.json({ message: 'Review added successfully.', reviewId: this.lastID });
        }
    );
});

module.exports = router;
