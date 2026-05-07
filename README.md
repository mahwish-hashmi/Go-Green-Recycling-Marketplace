# 🌱 Go Green – Recycling Marketplace

A full-stack web application designed to promote sustainable living by enabling users to buy, sell, and manage eco-friendly recycled products.

---

## 🚀 Overview

**Go Green** is a scalable full-stack platform built using Angular, Spring Boot, and MySQL. It provides a seamless experience for users to explore recycled products, manage carts, and interact with a secure backend powered by REST APIs and JWT authentication.

---

## ✨ Features

* 🔐 User Authentication (JWT-based login/signup)
* 🛍️ Product Listing & Details
* 🛒 Shopping Cart System
* 🔍 Search & Filter Products
* ⚡ RESTful API Integration
* 🧩 Modular & Scalable Architecture
* 💾 Persistent MySQL Database
* 🎨 Responsive UI (Angular)

---

## 🛠️ Tech Stack

| Layer    | Technology  |
| -------- | ----------- |
| Frontend | Angular 17  |
| Backend  | Spring Boot |
| Database | MySQL       |
| Auth     | JWT         |
| API      | REST APIs   |

---

## 🧱 Architecture

```
Angular (Frontend)
        ↓
REST API (Spring Boot Backend)
        ↓
MySQL Database
```

---

## 📸 Screenshots

> Add your UI screenshots here

```
/screenshots/home.png
/screenshots/login.png
/screenshots/products.png
```

---

## ⚙️ Installation & Setup

### 🔹 Clone Repository

```bash
git clone <your-repo-url>
cd Recycling-App-main
```

---

### 🔹 Backend Setup

```bash
cd Backend
mvn spring-boot:run
```

---

### 🔹 Frontend Setup

```bash
cd frontend
npm install
ng serve
```

---

### 🔹 Database Setup

* Start MySQL server
* Create database:

```sql
CREATE DATABASE ecommerce;
```

* Update credentials in:

```
application.properties
```

---

## 🔌 API Example

### Create Product

```http
POST /api/products
Content-Type: application/json
```

```json
{
  "name": "Eco Bottle",
  "description": "Reusable eco-friendly bottle",
  "price": 299
}
```

---

## 📁 Folder Structure

```
Recycling-App-main/
│
├── Backend/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── config/
│
├── frontend/
│   ├── components/
│   ├── services/
│   ├── models/
│   └── assets/
```

---

## 🔮 Future Enhancements

* 📦 Order Management System
* 💳 Payment Gateway Integration
* 🤖 AI-based product recommendations
* 📊 Admin Dashboard
* 📸 Image Upload Feature
* 🌍 Deployment (AWS / Docker)

---

## 👩‍💻 Author

**Mahwish Hashmi**
BTech Student | Full-Stack Developer

---

## ⭐ Why This Project?

This project demonstrates:

* Full-stack development skills
* REST API design
* Secure authentication (JWT)
* Scalable system design
* Real-world application architecture

---

⭐ *If you like this project, consider giving it a star!*
