# CSE1 Class Management Application

A comprehensive full-stack web application designed to streamline class management activities including attendance tracking, leave management, student information management, and announcements for CSE Section 1.

---

## 👨‍💻 Author

**Developed by A SRI SAI CHARAN**

This project was entirely designed, developed, and integrated by A SRI SAI CHARAN as a complete solution for managing class activities and data.

---

## 📖 Overview

The CSE1 Class Management Application is a modern web-based system built to help manage daily classroom operations efficiently. It provides distinct interfaces for students and administrators, enabling seamless attendance tracking, leave request management, and communication through announcements.

---

## ✨ Features

### Student Features
- **Attendance Lookup**: View personal attendance records securely
- **Student Dashboard**: Access personalized information and statistics
- **Announcements**: Stay updated with class notifications
- **Leave Requests**: Submit and track leave applications

### Administrator Features (Class Representatives)
- **Secure Authentication**: JWT-based admin login system
- **Dashboard Overview**: Real-time statistics and pending tasks
- **Student Management**: View, search, and manage student records
- **Attendance Management**: Mark, edit, and track attendance with automatic status calculation
- **Leave Management**: Review, approve, or reject student leave requests
- **Announcements**: Create and manage class-wide announcements
- **Data Export**: Export attendance data for reporting

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first styling
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### Tools & Libraries
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Git** - Version control

---

## 🏗 Architecture Overview

The application follows a three-tier architecture:

1. **Presentation Layer (Frontend)**
   - React-based SPA with TypeScript
   - Responsive UI with Tailwind CSS
   - Client-side routing and state management

2. **Application Layer (Backend)**
   - RESTful API built with Express.js
   - JWT-based authentication middleware
   - Business logic and data validation
   - Controller-based request handling

3. **Data Layer (Database)**
   - MongoDB for flexible document storage
   - Mongoose schemas for data modeling
   - Indexed collections for optimized queries

**Communication**: Frontend communicates with backend via HTTP REST API calls. Authentication tokens are included in request headers for secured endpoints.

---

## 📦 Installation & Setup

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **Git**

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   - Create a `.env` file in the `frontend` directory
   - Add the following configuration:
   ```
   VITE_API_BASE_URL=<your_backend_api_url>
   ```
   Example: `VITE_API_BASE_URL=http://localhost:5000/api`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   - Create a `.env` file in the `backend` directory
   - Add the following configuration:
   ```
   PORT=<port_number>
   MONGODB_URI=<your_database_url>
   JWT_SECRET=<your_jwt_secret_key>
   NODE_ENV=development
   ```

### Database Setup

1. **Local MongoDB**:
   - Install MongoDB Community Edition
   - Start MongoDB service
   - Use connection string: `mongodb://localhost:27017/classapp`

2. **MongoDB Atlas** (Cloud):
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Replace `<your_database_url>` with the connection string

3. **Seed the Database** (Optional):
   ```bash
   cd backend
   node seedDatabase.js
   ```

---

## 🚀 Running the Project Locally

### Start Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the server:
   ```bash
   npm start
   ```
   
   The backend server will run on `http://localhost:5000` (or your configured port)

### Start Frontend Application

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

### Production Build

To create a production build of the frontend:
```bash
cd frontend
npm run build
```

The optimized files will be generated in the `dist` directory.

---

## 📂 Folder Structure Overview

```
classapp/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── api/                 # API configuration and interceptors
│   │   ├── auth/                # Authentication guards and utilities
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Application pages/views
│   │   ├── routes/              # Routing configuration
│   │   ├── styles/              # Global styles and Tailwind config
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Application entry point
│   ├── public/                  # Static assets
│   └── package.json             # Frontend dependencies
│
├── backend/                     # Express.js backend API
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── models/              # Database schemas
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Custom middleware (auth, etc.)
│   │   └── server.js            # Server entry point
│   ├── data/                    # Data files for seeding
│   ├── scripts/                 # Utility scripts
│   └── package.json             # Backend dependencies
│
└── README.md                    # Project documentation
```

---

## 🎯 Key Features Explained

### Attendance System
- Real-time attendance marking and tracking
- Automatic calculation of attendance percentage
- Status classification (Eligible, Condonation, Detained)
- Historical attendance records
- CSV export functionality

### Leave Management
- Student leave request submission
- Admin approval workflow
- Status tracking (Pending, Approved, Rejected)
- Date validation and conflict checking

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- Role-based access control
- Secure session management

---

## 📄 License

**License**: MIT

**Copyright © A SRI SAI CHARAN**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## ⚠️ Disclaimer

This is an educational project developed for class management purposes. Internal documentation, sensitive configurations, environment variables, and credentials are intentionally excluded from this public repository for security reasons.

For internal setup documentation and configuration details, please refer to the private internal documentation or contact the developer directly.

---

## 🤝 Support

For questions, issues, or suggestions regarding this project, please reach out to the developer.

**Developed with dedication by A SRI SAI CHARAN**
```
