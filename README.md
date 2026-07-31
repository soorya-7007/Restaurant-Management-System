# 🍽️ Restaurant Management System

A full-stack, role-based restaurant management platform with real-time order tracking — built for Admins, Waiters, and Chefs to manage orders, inventory, and operations from a single system.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## 📖 Overview

This project simulates a real-world restaurant operations platform, similar to systems used by multi-branch restaurant chains. It handles the full order lifecycle — from a waiter placing an order at the POS, to the kitchen receiving it live on a Kitchen Display System (KDS), to an admin tracking sales and inventory in real time.

The system is built with **role-based access control**, so each user type sees only the interface relevant to their job:

| Role | Interface | Capabilities |
|------|-----------|---------------|
| 🧑‍💼 **Admin** | Analytics Dashboard | View sales trends, revenue, and stock insights across branches |
| 🧑‍🍳 **Chef** | Kitchen Display System (KDS) | Receive live incoming orders, update order status in real time |
| 🧑‍🔧 **Waiter** | Point of Sale (POS) | Take orders, manage tables, process checkout |

---

## ✨ Key Features

- 🔐 **JWT Authentication & Role-Based Access Control** — secure login with route protection based on user role (Admin / Waiter / Chef)
- ⚡ **Real-Time Order Sync** — orders placed at the POS appear instantly on the Kitchen Display System via WebSockets (Socket.io)
- 📊 **Admin Analytics Dashboard** — visualized sales and revenue trends using interactive charts
- 🧾 **Transactional Order Processing** — order creation, order items, and inventory deduction are handled as a single atomic database transaction
- 🏬 **Multi-Branch Support** — data (orders, inventory, users) is scoped by branch
- 🌗 **Modern, Responsive UI** — smooth animations and a polished dark-themed interface
- 🐳 **Dockerized Infrastructure** — MySQL and Redis services defined via Docker Compose for easy setup

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
---

## 🏗️ Architecture

```
restaurant-management/
├── frontend/               # React + Vite SPA
│   └── src/
│       ├── pages/          # Login, WaiterPOS, KitchenKDS, AdminDashboard
│       └── components/     # CheckoutModal, AIPredictor, etc.
│
├── backend/                # Node.js + Express API
│   └── src/
│       ├── controllers/    # Business logic (auth, orders)
│       ├── routes/         # API route definitions
│       ├── middleware/     # JWT auth & role-based guards
│       ├── models/         # Sequelize models
│       ├── migrations/     # Database schema migrations
│       └── seeders/        # Demo data seeders
│
└── docker-compose.yml       # MySQL + Redis services
```

**Order Flow:** Waiter places order at POS → order + items saved in a database transaction → inventory auto-deducted → event emitted via Socket.io → Kitchen Display System updates instantly.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for MySQL/Redis) — or use the built-in SQLite for quick local setup

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/restaurant-management.git
cd restaurant-management
```

### 2. Start the database services (optional — for MySQL/Redis)
```bash
docker-compose up -d
```

### 3. Backend setup
```bash
cd backend
npm install
cp .env.example .env    # configure your environment variables
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

### 4. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

---

## 🔮 Roadmap

- [ ] Wire up Redis for caching/session management
- [ ] Recipe-based inventory deduction (instead of generic stock reduction)
- [ ] Real AI-powered demand forecasting (currently a mocked UI concept)
- [ ] Automated test coverage expansion

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Your Name**
[GitHub](https://github.com/<your-username>) • [LinkedIn](https://linkedin.com/in/<your-profile>) • [Portfolio](#)
