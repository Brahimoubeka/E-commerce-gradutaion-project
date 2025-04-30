// messages.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Use the same secret as in auth.js (in production, store it securely)
const secret = process.env.JWT_SECRET || 'your_secret_key';

// Middleware to verify JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Please login first.' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Please login first.' });
    }
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token.' });
        }
        req.user = decoded;
        next();
    });
}

// POST /api/orders - Place an order
router.post('/orders', verifyToken, async (req, res) => {
    const { shippingName, shippingAddress, items } = req.body;
    const userId = req.user.userId;
    const orderDate = new Date().toISOString();
    const orderGroup = Date.now().toString();

    if (!shippingName || !shippingAddress || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing order details or empty cart.' });
    }

    try {
        // Check and update stock for each item
        for (const item of items) {
            const stockRes = await db.execute(
                'SELECT stock FROM Products WHERE id = ?',
                [item.id]
            );
            const currentStock = stockRes.rows[0]?.stock;
            if (currentStock === undefined) {
                return res.status(404).json({ error: `Product id ${item.id} not found.` });
            }
            if (currentStock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for product id ${item.id}.` });
            }
            await db.execute(
                'UPDATE Products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.id]
            );
        }

        // Insert orders
        for (const item of items) {
            await db.execute(
                'INSERT INTO Orders (user_id, product_id, quantity, shipping_name, shipping_address, order_date, status, order_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, item.id, item.quantity, shippingName, shippingAddress, orderDate, 'pending', orderGroup]
            );
        }

        res.json({ message: 'Order placed successfully.' });
    } catch (err) {
        console.error('Error processing order:', err);
        res.status(500).json({ error: 'Database error processing order.' });
    }
});

// GET /api/orders - Retrieve orders for the logged-in user
router.get('/orders', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const { rows } = await db.execute(
            'SELECT * FROM Orders WHERE user_id = ?',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Database error fetching orders.' });
    }
});

// GET /api/admin/orders - Retrieve all orders (admin only)
router.get('/admin/orders', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    const query = `
    SELECT 
      o.order_group,
      o.id AS orderId,
      o.quantity,
      o.order_date,
      o.status,
      o.shipping_name,
      o.shipping_address,
      u.name AS userName,
      u.email AS userEmail,
      p.name AS productName
    FROM Orders o
    JOIN Users u ON o.user_id = u.id
    JOIN Products p ON o.product_id = p.id
    ORDER BY o.order_group DESC, o.order_date DESC
  `;
    try {
        const { rows } = await db.execute(query, []);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching admin orders:', err);
        res.status(500).json({ error: 'Database error fetching orders.' });
    }
});

module.exports = router;











//const express = require('express');
//const router = express.Router();
//const db = require('../db');
//const jwt = require('jsonwebtoken');

//// Use the same secret as in auth.js (in production, store it securely)
//const secret = 'your_secret_key';

//// Middleware to verify JWT
//function verifyToken(req, res, next) {
//    const authHeader = req.headers['authorization'];
//    if (!authHeader) {
//        return res.status(401).json({ error: 'please login first' });
//    }

//    const token = authHeader.split(' ')[1]; // Expect format "Bearer <token>"
//    if (!token) {
//        return res.status(401).json({ error: 'please login first' });
//    }

//    jwt.verify(token, secret, (err, decoded) => {
//        if (err) {
//            return res.status(401).json({ error: 'Failed to authenticate token.' });
//        }
//        req.user = decoded; // Attach decoded token (userId, role, etc.)
//        next();
//    });
//}

//router.post('/orders', verifyToken, (req, res) => {
//    const { shippingName, shippingAddress, items } = req.body;
//    const userId = req.user.userId;
//    const orderDate = new Date().toISOString();

//    if (!shippingName || !shippingAddress || !items || !items.length) {
//        return res.status(400).json({ error: 'Missing order details or empty cart.' });
//    }

//    // Generate a unique order group identifier (using current timestamp)
//    const orderGroup = Date.now().toString();

//    let errorOccurred = false;
//    let completed = 0;
//    const totalItems = items.length;

//    items.forEach(item => {
//        // Update product stock first
//        db.run(
//            'UPDATE Products SET stock = stock - ? WHERE id = ? AND stock >= ?',
//            [item.quantity, item.id, item.quantity],
//            function (err) {
//                if (err) {
//                    console.error('Error updating stock for product id', item.id, err);
//                    errorOccurred = true;
//                    return res.status(500).json({ error: 'Error updating stock.' });
//                }
//                if (this.changes === 0) {
//                    errorOccurred = true;
//                    return res.status(400).json({ error: `Not enough stock for product id ${item.id}.` });
//                }

//                // Insert the order record with the generated orderGroup
//                db.run(
//                    'INSERT INTO Orders (user_id, product_id, quantity, shipping_name, shipping_address, order_date, status, order_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//                    [userId, item.id, item.quantity, shippingName, shippingAddress, orderDate, 'pending', orderGroup],
//                    function (err) {
//                        if (err) {
//                            console.error('Error inserting order for product id', item.id, err);
//                            errorOccurred = true;
//                            return res.status(500).json({ error: 'Error processing order.' });
//                        }

//                        completed++;
//                        if (completed === totalItems && !errorOccurred) {
//                            res.json({ message: 'Order placed successfully.' });
//                        }
//                    }
//                );
//            }
//        );
//    });
//});

//module.exports = router;



//// GET /api/orders - Retrieve orders for the logged-in user
//router.get('/orders', verifyToken, (req, res) => {
//    const userId = req.user.userId;
//    db.all('SELECT * FROM Orders WHERE user_id = ?', [userId], (err, rows) => {
//        if (err) {
//            console.error('Error fetching orders:', err);
//            return res.status(500).json({ error: 'Database error fetching orders.' });
//        }
//        res.json(rows);
//    });
//});



//// GET /api/admin/orders - Retrieve all orders (admin only), grouped by order_group
//router.get('/admin/orders', verifyToken, (req, res) => {
//    if (req.user.role !== 'admin') {
//        return res.status(403).json({ error: 'Admin access required.' });
//    }
//    const query = `
//    SELECT 
//      o.order_group,
//      o.id AS orderId,
//      o.quantity,
//      o.order_date,
//      o.status,
//      o.shipping_name,
//      o.shipping_address,
//      u.name AS userName,
//      u.email AS userEmail,
//      p.name AS productName
//    FROM Orders o
//    JOIN Users u ON o.user_id = u.id
//    JOIN Products p ON o.product_id = p.id
//    ORDER BY o.order_group DESC, o.order_date DESC
//  `;
//    db.all(query, [], (err, rows) => {
//        if (err) {
//            console.error('Error fetching admin orders:', err);
//            return res.status(500).json({ error: 'Database error fetching orders.' });
//        }
//        res.json(rows);
//    });
//});
