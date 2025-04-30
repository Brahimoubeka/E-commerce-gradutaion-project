const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/products - Fetch all products
router.get('/products', async (req, res) => {
    try {
        const { rows } = await db.execute('SELECT * FROM Products', []);
        res.json(rows);
    } catch (err) {
        console.error('Error retrieving products:', err);
        res.status(500).json({ error: 'Database error retrieving products.' });
    }
});

// GET /api/products/:id - Fetch details for a specific product
router.get('/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const { rows } = await db.execute('SELECT * FROM Products WHERE id = ?', [productId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error retrieving product:', err);
        res.status(500).json({ error: 'Database error retrieving product.' });
    }
});

// GET /api/products/latest - Fetch the two most recently added products
router.get('/products/latest', async (req, res) => {
    try {
        const { rows } = await db.execute('SELECT * FROM Products ORDER BY id DESC LIMIT 2', []);
        res.json(rows);
    } catch (err) {
        console.error('Error retrieving latest products:', err);
        res.status(500).json({ error: 'Database error retrieving latest products.' });
    }
});

module.exports = router;










//const express = require('express');
//const router = express.Router();
//const db = require('../db');

//// GET /api/products - Fetch all products
//router.get('/products', (req, res) => {
//    db.all('SELECT * FROM Products', [], (err, rows) => {
//        if (err) {
//            console.error('Error retrieving products:', err);
//            return res.status(500).json({ error: 'Database error retrieving products.' });
//        }
//        res.json(rows);
//    });
//});

//// GET /api/products/:id - Fetch details for a specific product
//router.get('/products/:id', (req, res) => {
//    const productId = req.params.id;
//    db.get('SELECT * FROM Products WHERE id = ?', [productId], (err, row) => {
//        if (err) {
//            console.error('Error retrieving product:', err);
//            return res.status(500).json({ error: 'Database error retrieving product.' });
//        }
//        if (!row) {
//            return res.status(404).json({ error: 'Product not found.' });
//        }
//        res.json(row);
//    });
//});


//// GET /api/products/latest - Fetch the two most recently added products
//router.get('/products/latest', (req, res) => {
//    db.all('SELECT * FROM Products ORDER BY id DESC LIMIT 2', [], (err, rows) => {
//        if (err) {
//            console.error("Error retrieving latest products:", err);
//            return res.status(500).json({ error: 'Database error retrieving latest products.' });
//        }
//        res.json(rows);
//    });
//});


//module.exports = router;
