# 🚦 OptiTrack Inventory Control System

A high-fidelity, full-stack inventory management solution designed for real-time logistics tracking and automated warehouse oversight. 

**Academic Project: Second Year DBMS**

---

## 🌟 Key Features
*   **Neon-Industrial Dashboard**: Custom-built high-contrast UI with real-time data synchronization.
*   **Automated Stock Integrity**: SQL Triggers enforce business logic (e.g., preventing orders with insufficient stock).
*   **Dynamic Logistics Monitoring**: Hub utilization tracking using advanced SQL Join views and real-time capacity progress indicators.
*   **Low Stock Triage**: Automated alerting system for critical assets based on SQL views.
*   **Dynamic Employee Metrics**: Real-time age calculation using `TIMESTAMPDIFF` views.

---

## 📁 System Architecture

```bash
DBMS/
├── database/            # Relational Foundation
│   ├── schema.sql       # Core Schema & Normalization
│   ├── procedures.sql   # The "Brain" (Triggers, Views, Procedures)
│   └── seed.sql         # Idempotent Data Population
├── backend/             # Audit & Orchestration Layer (Node.js/Express)
│   ├── src/index.js     # System API Core
│   └── .env             # Database Connectivity
└── frontend/            # Control Center Interface (React + Vite)
    ├── src/App.jsx      # Dashboard Logic & RBAC
    └── src/index.css    # High-Fidelity Design System
```

---

## 🚀 Final Deployment & Initialization

### 1. Database Layer
1.  Run **`database/schema.sql`** to build the relational structure.
2.  Run **`database/procedures.sql`** to activate triggers and views.
3.  Run **`database/seed.sql`** to populate the operational test data.

### 2. Backend Engine
```bash
cd backend
npm install
npm start
```

### 3. Management Interface
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Tech Stack
*   **Database:** MySQL 8.0
*   **Backend:** Node.js, Express.js, `mysql2`
*   **Frontend:** React 18, Vite, Vanilla CSS
*   **Aesthetics:** High-Contrast Control Center (Neon Lime)
