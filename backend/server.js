const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 0. Mock Login (RBAC)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple mock logic for DBMS project demonstration
    if (username === 'admin' && password === 'admin') {
        res.json({ id: 1, name: 'Rahul Sharma', role: 'Admin', token: 'mock-jwt-admin' });
    } else if (username === 'staff' && password === 'staff') {
        res.json({ id: 2, name: 'Sneha Patil', role: 'Staff', token: 'mock-jwt-staff' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// 1. Dashboard Stats
app.get('/api/stats', async (req, res) => {
    try {
        const [products] = await db.query('SELECT COUNT(*) as count FROM products');
        const [lowStock] = await db.query('SELECT COUNT(*) as count FROM view_low_stock_alerts');
        const [orders] = await db.query('SELECT COUNT(*) as count FROM orders');
        
        res.json({
            totalProducts: products[0].count,
            lowStockItems: lowStock[0].count,
            totalOrders: orders[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get All Products with Stock Levels
app.get('/api/products', async (req, res) => {
    try {
        const sql = `
            SELECT p.*, c.cname as category, SUM(pw.stock) as total_stock 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_warehouses pw ON p.id = pw.product_id
            GROUP BY p.id
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Low Stock Alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM view_low_stock_alerts');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Order History (Summary)
app.get('/api/orders', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM view_order_summary ORDER BY order_date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Create New Order (Trigger Test)
app.post('/api/orders', async (req, res) => {
    const { product_id, warehouse_id, customer_id, quantity, price } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO orders (product_id, warehouse_id, customer_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [product_id, warehouse_id, customer_id, quantity, price]
        );
        res.status(201).json({ message: 'Order created successfully', orderId: result.insertId });
    } catch (err) {
        // This will catch the 'Insufficient stock' error from our MySQL trigger!
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`OptiTrack Backend running on http://localhost:${PORT}`);
});
