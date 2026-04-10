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

// 1. Get Dashboard Stats
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

// 2. Get Inventory List (using our view)
app.get('/api/inventory', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.pname as name, w.w_name as warehouse, pw.stock, 
            CASE WHEN pw.stock <= 10 THEN 'Critical' ELSE 'Stable' END as status
            FROM products p
            JOIN product_warehouses pw ON p.id = pw.product_id
            JOIN warehouses w ON pw.warehouse_id = w.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Place Order (Tests the Trigger!)
app.post('/api/orders', async (req, res) => {
    const { product_id, warehouse_id, customer_id, quantity, price } = req.body;
    try {
        await pool.query(
            'INSERT INTO orders (product_id, warehouse_id, customer_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [product_id, warehouse_id, customer_id, quantity, price]
        );
        res.json({ message: 'Order placed successfully. Inventory updated!' });
    } catch (err) {
        // This will capture the SIGNAL error from our SQL trigger!
        res.status(400).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`OptiTrack Backend listening on port ${PORT}`);
});
