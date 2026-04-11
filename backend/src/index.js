const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'OptiTrack',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- API ENDPOINTS ---

// 1. Dashboard Stats
app.get('/api/stats', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT COUNT(*) as count FROM products');
        const [lowStock] = await pool.query('SELECT COUNT(*) as count FROM view_low_stock_alerts');
        const [orders] = await pool.query('SELECT COUNT(*) as count FROM orders');
        
        res.json({
            totalProducts: products[0].count,
            lowStockCount: lowStock[0].count,
            ordersProcessed: orders[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Full Inventory List
app.get('/api/inventory', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id as asset_id, p.pname as name, c.cname as category, 
                   w.w_name as hub, pw.stock, 
                   CASE WHEN pw.stock <= 10 THEN 'CRITICAL' 
                        WHEN pw.stock <= 25 THEN 'WARNING' 
                        ELSE 'OPTIMAL' END as status
            FROM products p
            JOIN product_warehouses pw ON p.id = pw.product_id
            JOIN warehouses w ON pw.warehouse_id = w.id
            JOIN categories c ON p.category_id = c.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Supporting Data for Order Form
app.get('/api/metadata', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT id, pname as name FROM products');
        const [warehouses] = await pool.query('SELECT id, w_name as name FROM warehouses');
        const [customers] = await pool.query('SELECT id, name FROM customers');
        res.json({ products, warehouses, customers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Place Order (Tests SQL Trigger)
app.post('/api/orders', async (req, res) => {
    const { product_id, warehouse_id, customer_id, quantity, price } = req.body;
    try {
        await pool.query(
            'INSERT INTO orders (product_id, warehouse_id, customer_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [product_id, warehouse_id, customer_id, quantity, price]
        );
        res.json({ success: true, message: 'Order synchronized across logistics network.' });
    } catch (err) {
        // Trigger SIGNAL errors caught here
        res.status(400).json({ error: err.message });
    }
});

// 5. Recent Alerts (for dashboard)
app.get('/api/alerts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM view_low_stock_alerts LIMIT 5');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Hub Logistics Data
app.get('/api/hubs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT w.id, w.w_name as name, w.location, w.capacity,
            SUM(pw.stock) as current_stock,
            (SUM(pw.stock) / w.capacity * 100) as utilization
            FROM warehouses w
            LEFT JOIN product_warehouses pw ON w.id = pw.warehouse_id
            GROUP BY w.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`OptiTrack Backend initialized on port ${PORT}`);
});
