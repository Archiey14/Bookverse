# Bookverse

Full-stack e-commerce web platform for browsing, exploring, and purchasing books, featuring integrated payment processing, user reviews, dynamic theme switching, and hybrid authentication.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Security Specifications](#security-specifications)
- [Authors](#authors)

---

## Overview

Bookverse is a modern web application designed to deliver an end-to-end online bookstore experience. The application combines a high-performance React frontend with an Express and MongoDB backend. Authentication supports both traditional email/password workflows and one-click Google OAuth via Firebase, keeping user profiles, shopping sessions, catalogs, and transaction records unified in MongoDB.

---

## Key Features

### Catalog & Discovery
- **Multi-Faceted Search and Filtering:** Dynamic catalog filtering by category, price range, ratings, and format with responsive drawer controls.
- **Search Suggestions:** Real-time search indexing with automatic keyword suggestions.
- **Interactive Shelves:** Featured shelves for bestsellers, new arrivals, and category-specific carousels.

### Authentication & User Management
- **Hybrid Authentication:** Google Sign-In powered by Firebase Authentication combined with local bcrypt-hashed credentials.
- **Unified MongoDB Accounts:** Google OAuth identities and local accounts are synchronized directly with MongoDB user documents.
- **Session Security:** Cryptographically signed JSON Web Tokens (JWT) for stateless session handling and protected endpoints.

### Checkout & Payments
- **Razorpay Integration:** Integrated payment gateway with cryptographic HMAC-SHA256 signature verification.
- **Automated Invoicing:** Transaction settlement and order confirmation emails dispatched via Nodemailer.

### Cart, Wishlist & Reviews
- **Persistent State:** Synchronized cart and wishlist management stored in MongoDB for registered users, with localStorage fallback for guests.
- **User Reviews & Ratings:** Verified customer review submissions, composite star ratings, and community feedback.

### User Interface & Accessibility
- **Adaptive Theme Engine:** High-contrast Dark and Light themes with persistent preference storage via localStorage.
- **Responsive Layout:** Mobile-first layout optimized across mobile, tablet, and desktop viewports.
- **Modal Scroll Lock:** Focus-trapped authentication modals with background scroll-lock enforcement.

---

## Architecture & Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Authentication Client:** Firebase Client SDK (v12+)
- **HTTP Client:** Axios
- **Styling:** Modular CSS architecture with design tokens and Dark/Light theme rules

### Backend
- **Runtime Environment:** Node.js (ECMAScript Modules)
- **Web Framework:** Express 5
- **Object Data Modeling (ODM):** Mongoose 9
- **Database:** MongoDB Atlas / Local MongoDB
- **Authentication Admin:** Firebase Admin SDK & JSON Web Tokens (JWT)
- **Payment Processing:** Razorpay Node SDK
- **Email Delivery:** Nodemailer

---

## Repository Structure

```text
Bookverse-1/
├── backend/
│   ├── data/                           # Seed datasets and backups
│   ├── middleware/                     # JWT authentication and role authorization
│   ├── routes/
│   │   ├── account.js                  # User profile, shipping, and order history
│   │   ├── admin.js                    # Admin dashboard metrics and inventory
│   │   ├── auth.js                     # Local login, registration, and Firebase Google auth
│   │   ├── books.js                    # Catalog queries, filters, and book details
│   │   ├── payments.js                 # Razorpay order creation and webhook verification
│   │   └── reviews.js                  # Customer book reviews and ratings
│   ├── config.js                       # Server and token configuration
│   ├── db.js                           # Mongoose connection and schemas
│   ├── server.js                       # Express application entry point
│   ├── .env.example                    # Template environment variables
│   └── firebase-service-account.json   # Firebase Admin private credentials (git-ignored)
│
├── frontend/
│   └── app/
│       ├── src/
│       │   ├── components/             # Reusable UI components, header, footer, modals
│       │   ├── hooks/                  # Custom hooks (useAuth, useTheme, useScrollLock)
│       │   ├── pages/                  # Landing, Login, Register, Catalog, Admin, Legal
│       │   ├── firebase.js             # Client-side Firebase configuration
│       │   ├── storefront.css          # Core storefront styling
│       │   ├── dark-theme.css          # Dark theme overrides
│       │   ├── App.jsx                 # Application route registry
│       │   └── main.jsx                # Application root mount
│       ├── .env.example                # Template frontend environment variables
│       └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

Ensure the following tools are installed on your environment:
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** Active connection string (local or MongoDB Atlas)
- **Firebase Project:** Configured with Google Authentication enabled

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the environment configuration file:
   Create a `.env` file in `backend/` with the following variables:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   ```

4. Add Firebase Service Account Credentials:
   - In the Firebase Console, navigate to **Project Settings** > **Service accounts**.
   - Click **Generate new private key** and download the JSON file.
   - Place this file in `backend/` and rename it to:
     ```
     firebase-service-account.json
     ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will initialize on `http://localhost:5001`.

---

### Frontend Setup

1. Navigate to the frontend application directory:
   ```bash
   cd ../frontend/app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Optional: Configure environment variables:
   Create a `.env.local` file in `frontend/app/` if overriding default build configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application interface will be available at `http://localhost:5173`.

---

## API Reference

### Authentication Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register account with email and password | Public |
| `POST` | `/api/auth/login` | Authenticate with email and password | Public |
| `POST` | `/api/auth/firebase-google` | Authenticate with Firebase Google ID token | Public |

### Catalog & Reviews
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/books` | List books with query-based filtering | Public |
| `GET` | `/api/books/:id` | Fetch specific book by identifier | Public |
| `GET` | `/api/reviews/:bookId` | Retrieve reviews for specified book | Public |
| `POST` | `/api/reviews` | Submit a review and numeric rating | Authenticated |

### Checkout & Orders
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-order` | Initialize a Razorpay checkout session | Authenticated |
| `POST` | `/api/payments/verify` | Verify payment signature and create order | Authenticated |
| `GET` | `/api/account/orders` | Retrieve authenticated user's order history | Authenticated |
| `GET` | `/api/admin/stats` | Access platform metrics and revenue data | Administrator |

---

## Security Specifications

- **Secret Management:** `.env` files and `firebase-service-account.json` are excluded from version control via `.gitignore`.
- **Password Protection:** User passwords are encrypted using salted `bcryptjs` hashing with a minimum work factor of 10.
- **Cryptographic Signatures:** Razorpay payment verifications use server-side HMAC-SHA256 signature validation before order completion.
- **Token Validation:** Firebase authentication tokens are cryptographically verified using the official Firebase Admin SDK before granting session tokens.

---

## Authors

Developed by **Archie Yadav** and **Niranjan Arvapalli**
