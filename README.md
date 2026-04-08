# OptiTrack: The Digital Observatory 🌌
### Premium Inventory Control & Logistics Management System

**OptiTrack** is a high-fidelity inventory management system designed for the "Ethereal Professional." It transitions away from traditional utilitarian dashboards into a cinematic, data-immersive command center. 

Built with a robust **MySQL** backend, an **Express.js** API bridge, and a **React+Vite** frontend utilizing deep-space glassmorphism.

---

## 🚀 Key Features

### 💎 The Observatory Interface
- **Refraction-Based UI:** Intentional asymmetry and tonal layering with 12px backdrop blurring.
- **The "No-Line" Philosophy:** Structural hierarchy defined by light and shadow, not rigid borders.
- **Role-Based Access Control (RBAC):** Distinct specialized dashboards for **Admins** and **Staff**.

### 🧠 Advanced System Intelligence
- **Inventory Integrity Flux:** Real-time stock tracking with automatic synchronization.
- **Automation Triggers:** Database-level logic to prevent over-orders and auto-decrement stock.
- **Observatory Analytics:** Join-views for simplified business reporting (`view_order_summary`).
- **Logistics Alerts:** Critical reorder notifications triggered at specific magnitude thresholds.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Lucide React, Glassmorphism CSS |
| **Backend** | Node.js, Express.js, MySQL2 |
| **Database** | MySQL (3NF Normalized, Triggers, Views, Procedures) |
| **Design** | The "Digital Observatory" System |

---

## 📦 Project Structure

```bash
OptiTrack/
├── database/           # SQL initialization scripts
├── backend/            # Express API server
├── frontend/           # React dashboard
├── docs/               # Schema diagrams and documentation
├── .gitignore          # Repository exclusions
└── README.md           # Project documentation
```

---

## ⚙️ Quick Start

### 1. Database Setup
1. Create a MySQL database named `OptiTrack`.
2. Execute scripts in this order:
   - `database/schema.sql` (Foundation)
   - `database/advanced.sql` (Triggers/Views)
   - `database/seed.sql` (Sample Data)

### 2. Backend Config
1. `cd backend`
2. `npm install`
3. Configure `.env` with your DB credentials.
4. `npm start`

### 3. Frontend Config
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## 🔑 Access Protocols
| Identity | Role | Access Code |
| :--- | :--- | :--- |
| `admin` | System Admin | `admin` |
| `staff` | Logistics Staff | `staff` |

---

## 📜 License
This project was developed as part of a Second Year DBMS Academic submission.
All designs are inspired by the "Ethereal Professional" system.
