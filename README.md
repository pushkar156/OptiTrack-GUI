# OptiTrack Inventory Control System

A modern full-stack inventory management system built with React, Node.js, and MySQL.

## 📁 Project Structure

```bash
DBMS/
├── database/            # SQL Foundation
│   ├── schema.sql       # Core table definitions
│   ├── procedures.sql   # Triggers, Views, and Procedures
│   └── seed.sql         # Dummy data for testing
├── backend/             # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Database connection setup
│   │   ├── controllers/ # Route logic
│   │   ├── routes/      # API Endpoints
│   │   └── index.js     # Server entry point
│   └── package.json
├── frontend/            # React + Vite UI
│   ├── src/
│   │   ├── components/  # Reusable UI parts
│   │   ├── pages/       # Dashboard and Forms
│   │   ├── styles/      # CSS / Glassmorphism
│   │   └── main.jsx
│   └── package.json
└── docs/                # Project Documentation
    ├── Relational Schema.pdf
    └── tables.png
```

## 🛠️ Getting Started

### 1. Database Setup
Execute the scripts in the `database/` folder in the following order:
1. `schema.sql`
2. `procedures.sql`
3. `seed.sql`

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## ✨ Features
- **Real-time Inventory Tracking:** Triggers automatically update stock levels.
- **Low Stock Alerts:** Automated views to flag restocking needs.
- **Role-Based Views:** Optimized for Warehouse Managers and Staff.
