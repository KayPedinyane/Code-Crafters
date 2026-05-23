# SkillsBridge SA 🌍

**Connecting South African youth with skills development opportunities**

SkillsBridge SA is a comprehensive web platform that bridges the gap between opportunity seekers and providers, facilitating access to internships, learnerships, and apprenticeships across South Africa.

[![codecov](https://codecov.io/gh/KayPedinyane/Code-Crafters/branch/main/graph/badge.svg)](https://codecov.io/gh/KayPedinyane/Code-Crafters)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/KayPedinyane/Code-Crafters)
[![Coverage](https://img.shields.io/badge/coverage-70%25-yellowgreen)](https://codecov.io)

---

## 📋 **Table of Contents**

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Contact](#contact)

---

## ✨ **Features**

### **For Applicants:**
- 🔍 Browse opportunities by sector, location, and NQF level
- 📝 Create and manage comprehensive profiles
- 📄 Upload CVs and track application status
- 🔔 Real-time notifications for application updates
- 🎯 Personalized opportunity matching
- 📊 Application analytics and tracking

### **For Providers:**
- 📢 Post and manage opportunities
- 👥 Review applications and manage applicants
- ✅ Update application statuses (pending, shortlisted, accepted, rejected)
- 📧 Automated email notifications to applicants
- 📈 Analytics dashboard for posted opportunities

### **For Admins:**
- 🛡️ Approve/reject provider registrations
- 📊 System-wide analytics and reporting
- 👤 User management
- 🔐 Role-based access control

---

## 🛠️ **Tech Stack**

### **Frontend:**
- **Framework:** React 18
- **Routing:** React Router v6
- **Styling:** Custom CSS with responsive design
- **Authentication:** Firebase Authentication
- **HTTP Client:** Fetch API
- **Testing:** Jest + React Testing Library
- **Coverage:** 83%

### **Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** Firebase Admin SDK
- **Email Service:** Brevo (formerly Sendinblue)
- **File Upload:** Multer
- **Testing:** Jest + Supertest
- **Coverage:** 71%

### **Additional Services:**
- **Geolocation:** BigDataCloud Reverse Geocoding API
- **Province/City Data:** CountriesNow API

---

## 📦 **Prerequisites**

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

---

## 🚀 **Installation**

### **1. Clone the Repository**

```bash
git clone https://github.com/KayPedinyane/Code-Crafters.git
cd Code-Crafters
```

### **2. Install Backend Dependencies**

```bash
cd backend
npm install
```

### **3. Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

### **4. Database Setup**

Contact the project maintainers for database schema or set up your own MySQL instance.

```bash
# Create MySQL database
mysql -u root -p

CREATE DATABASE skillsbridge_db;
USE skillsbridge_db;
```

---

## 🔐 **Environment Variables**

### **Backend (.env)**

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
BACKEND_URL=http://localhost:5000

# Database Configuration (Railway)
MYSQLHOST=your-database-host
MYSQLUSER=your-database-user
MYSQLPASSWORD=your-database-password
MYSQLDATABASE=your-database-name
MYSQLPORT=your-database-port

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT=<your-firebase-service-account-json>

# Brevo Email Service
BREVO_API_KEY=your-brevo-api-key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Environment
NODE_ENV=development
```

### **Frontend (.env)**

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

> ⚠️ **Never commit `.env` files to Git!** These files contain sensitive credentials.

---

## ▶️ **Running the Application**

### **Development Mode**

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### **Production Build**

**Backend:**
```bash
cd backend
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm install -g serve
serve -s build -p 3000
```

---

## 🧪 **Testing**

### **Backend Tests**

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test tests/applications.test.js

# Run verbose
npm test -- --verbose
```

**Coverage:** 71%

### **Frontend Tests**

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test ProviderOpportunityForm.test.js
```

**Coverage:** 83%

### **View Coverage Reports**

```bash
# Backend
open backend/coverage/lcov-report/index.html

# Frontend
open frontend/coverage/lcov-report/index.html
```

---

## 📁 **Project Structure**
Code-Crafters/
├── backend/
│   ├── routes/              # API route handlers
│   │   ├── applications.js
│   │   ├── login.js
│   │   ├── opportunities.js
│   │   ├── profile.js
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── emailSender.js
│   │   └── notificationChecker.js
│   ├── tests/               # Test files
│   │   ├── applications.test.js
│   │   ├── login.test.js
│   │   └── ...
│   ├── mocks/           # Jest mocks
│   │   ├── @getbrevo/
│   │   ├── firebase-admin.js
│   │   └── multer.js
│   ├── data/                # Static data
│   │   └── nqf.json
│   ├── uploads/             # File uploads
│   ├── app.js               # Express app
│   ├── db.js                # Database connection
│   ├── index.js             # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── tests/           # Test files
│   │   ├── App.js
│   │   ├── firebase.js
│   │   └── index.js
│   └── package.json
│
├── README.md
└── .gitignore

---

## 📡 **API Documentation**

### **Authentication**

Protected routes require Firebase JWT token in the Authorization header:
Authorization: Bearer <firebase-token>

### **Key Endpoints**

#### **Auth Routes** (`/auth`)
- `POST /auth/login` - User login
- `POST /auth/create` - Create user
- `DELETE /auth/user/:uid` - Delete user

#### **Opportunities** (`/opportunities`)
- `GET /opportunities` - Get all opportunities
- `POST /opportunities` - Create opportunity
- `GET /opportunities/:id` - Get single opportunity
- `PUT /opportunities/:id` - Update opportunity
- `DELETE /opportunities/:id` - Delete opportunity

#### **Applications** (`/applications`)
- `POST /applications` - Submit application
- `GET /applications/:email` - Get user's applications
- `GET /applications/opportunities/:id` - Get opportunity applications
- `PATCH /applications/:id/status` - Update application status

#### **Profile** (`/profile`)
- `POST /profile` - Create/update profile
- `GET /profile/:email` - Get profile

#### **Provider Profile** (`/provider-profile`)
- `POST /provider-profile` - Create provider profile
- `GET /provider-profile` - Get all providers
- `PUT /provider-profile/:id/status` - Update provider status

---

## 📊 **Testing Coverage**

- **Backend:** 71% coverage
- **Frontend:** 83% coverage
- **Total Tests:** 150+
- **All tests passing:** ✅

---

## 👥 **Team**

- **Kamogelo Pedinyanae**
- **Zandile Mkontwana**
- **Kutloano Diale**
- **Mlungisi Mahlangu**
- **Nkqubela Ronie Hokwana**

---

## 📧 **Contact**

**Project Repository:** [https://github.com/KayPedinyane/Code-Crafters](https://github.com/KayPedinyane/Code-Crafters)

**Email:** skillsbridgesa@gmail.com

---

## 🙏 **Acknowledgments**

- South African SETA organizations for sector information
- Firebase for authentication services
- Brevo for email services
- BigDataCloud for geolocation services
- All contributors and testers

---

**Built with ❤️ in South Africa**
