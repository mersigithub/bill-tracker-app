# Bill Tracking Web App

A secure, full-stack bill tracking application that allows users to upload and manage bills monthly, and enables admins to monitor activity with role-based access control. Built using **React**, **Node.js**, **Express**, and **MongoDB**, and deployed with **CI/CD** on **Vercel**.

---

## Live Demo

- [User View](https://bill-app-frontend.vercel.app/)
- [Admin View](https://bill-app-frontend.vercel.app/admin)

---

## Features

### Authentication
- Secure JWT-based login/logout
- Password reset flow with tokenized email verification
- Role-based access control (RBAC) for Admin and User roles

### User Dashboard
- Upload bill images by month
- View previously uploaded bills

### Admin Dashboard
- View list of all users
- See uploaded bills by user and by month
- Toggle between Members and Invoices view

### System Features
- RESTful API with proper error handling, validation, and rate limiting
- Protected routes using custom middleware
- CI/CD pipeline for seamless updates
- Deployed on Vercel (frontend) and your backend deployment platform


## Tech Stack

| Frontend  | Backend       | Database | DevOps         | Other Tools          |
|-----------|---------------|----------|----------------|----------------------|
| React     | Node.js       | MongoDB  | GitHub Actions | JWT Auth             |
| HTML/CSS  | Express.js    | Mongoose | Vercel         | Postman / cURL       |
| Bootstrap | RESTful APIs  |          |                | Role-Based Routing   |


### 1. Clone the repo
git clone https://github.com/your-username/bill-tracking-app.git
cd bill-tracking-app

### cd bill-app-backend
===create .env and replace===
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
PORT=5001
REACT_APP_API_URL=http://localhost:5001

# Backend
cd bill-app-backend
npm install

# Frontend
cd ../bill-app-frontend
npm install


**Note:** The backend API (`https://bill-app-backend-production.up.railway.app/api`) is currently **inactive** due to the Railway free tier trial expiration. As a result, some features of the application may not function as expected (e.g., login, invoice upload).

I'm actively working on migrating the backend to a new hosting platform. Feel free to explore the code or contribute!
You can run locally by replacing http://localhost:5001
