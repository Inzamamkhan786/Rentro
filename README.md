# 🚗 Rentro – Vehicle Rental Platform

Rentro is a full-stack vehicle rental platform where users can **rent vehicles** or **list their own vehicles to earn money**. The system supports two roles: **Consumer** and **Provider**, making it a complete peer-to-peer rental ecosystem.

---

## 📌 Features

### 👤 Consumer (Renter)

* Browse available vehicles
* View vehicle details (price, type, availability)
* Book vehicles on an hourly basis
* Secure payment system
* Track booking history

### 🚘 Provider (Owner)

* List vehicles with complete details
* Upload vehicle images and documents
* Set hourly pricing
* Manage bookings and availability
* Earn money by renting out vehicles

### 🔐 Authentication & Security

* User signup/login system
* Role-based access (Consumer / Provider / Admin)
* JWT authentication
* Secure API endpoints

### 📄 Verification System

* Driving License verification
* Vehicle RC verification
* Pollution certificate upload
* Document management system

### 💬 Additional Features

* Real-time chat system
* Support ticket system
* Admin dashboard for management
* Error handling & validation middleware

---

## 🛠️ Tech Stack

### 🔹 Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### 🔹 Frontend

* HTML / CSS / JavaScript (or React if used)

### 🔹 Other Tools

* JWT (Authentication)
* Multer (File Upload)
* Cloud Storage (if used)
* REST API Architecture

---

## 📂 Project Structure

```
Rentro/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── modules/
│   │   ├── utils/
│   │   └── server.js
│   ├── tests/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/inzamamkhan786/Rentro.git
cd Rentro
```

---

### 2️⃣ Install dependencies

```bash
cd server
npm install
```

---

### 3️⃣ Setup environment variables

Create a `.env` file in the server folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Run the project

```bash
npm run dev
```

or

```bash
npm start
```

---

## 📡 API Modules

* Auth (Login / Signup)
* Users
* Vehicles
* Bookings
* Payments
* Documents
* Chat
* Support

---

## 🧪 Testing

Run tests using:

```bash
npm test
```

---

## 📸 Screenshots

(Add your UI screenshots here)

---

## 🚀 Future Enhancements

* Live vehicle tracking
* AI-based pricing suggestion
* Mobile app integration
* Rating & review system

---

## 👨‍💻 Author

**Mohd Inzamamul Haque**
B.Tech CSE (HCI & Gaming Technology)
IIIT Nagpur

---

## ⭐ Contribute

Feel free to fork this repository and contribute!

---

## 📜 License

This project is licensed under the MIT License.

---
