# Backend Test Instructions

## ✅ Complete Backend Files Created

1. **backend/package.json** - Dependencies and scripts
2. **backend/.env** - Environment variables with hashed password
3. **backend/.gitignore** - Git ignore rules
4. **backend/src/server.js** - Express server
5. **backend/src/controllers/authController.js** - Login logic
6. **backend/src/routes/authRoutes.js** - Auth routes
7. **backend/src/middleware/authMiddleware.js** - JWT protection middleware
8. **backend/generateHash.js** - Password hash generator
9. **backend/README.md** - Documentation

## 🚀 How to Start the Server

### Option 1: Using npm (Recommended)
```bash
cd backend
npm install
npm run dev
```

### Option 2: Using node directly
```bash
cd backend
npm install
node src/server.js
```

## 🧪 Testing the API

### Test 1: Health Check
Open browser or use curl/Postman:
```
GET http://localhost:5000/
```

Expected Response:
```json
{
  "message": "Class Management Backend API is running"
}
```

### Test 2: CR Login (Valid Credentials)
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "cse1.cr@gmail.com",
  "password": "StrongPassword123"
}
```

Expected Response (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "CR"
}
```

### Test 3: CR Login (Invalid Email)
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "wrong@email.com",
  "password": "StrongPassword123"
}
```

Expected Response (401):
```json
{
  "message": "Invalid credentials"
}
```

### Test 4: CR Login (Invalid Password)
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "cse1.cr@gmail.com",
  "password": "WrongPassword"
}
```

Expected Response (401):
```json
{
  "message": "Invalid credentials"
}
```

## 🔒 Testing Protected Routes

To add a protected test route, update `src/routes/authRoutes.js`:

```javascript
import { protectCR } from '../middleware/authMiddleware.js';

// Add this route
router.get('/protected', protectCR, (req, res) => {
  res.json({ 
    message: 'Access granted to CR',
    user: req.user 
  });
});
```

Then test:
```bash
GET http://localhost:5000/api/auth/protected
Authorization: Bearer <your_token_here>
```

## 📋 Using Postman

1. **Import Collection:**
   - Create new request
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body: raw JSON
   ```json
   {
     "email": "cse1.cr@gmail.com",
     "password": "StrongPassword123"
   }
   ```

2. **Save Token:**
   - Copy the token from response
   - Create new request for protected routes
   - Headers: `Authorization: Bearer <token>`

## 🔧 Troubleshooting

### Server won't start
- Check if port 5000 is in use
- Verify Node.js is installed: `node --version`
- Run `npm install` again

### Login returns 401
- Verify .env has correct hashed password
- Check if email exactly matches: `cse1.cr@gmail.com`
- Ensure password is: `StrongPassword123`

### Token errors
- Check JWT_SECRET in .env
- Verify token is passed as: `Bearer <token>`
- Token expires after 8 hours

## ✨ Key Features Implemented

✅ CR login using environment variables (NO database)  
✅ Password hashing with bcryptjs  
✅ JWT token generation (8-hour expiry)  
✅ protectCR middleware for route protection  
✅ Proper error handling and validation  
✅ CORS enabled for frontend integration  
✅ Clean code structure with controllers/routes/middleware  

## 🔗 Frontend Integration

In your React/frontend app:

```javascript
// Login function
const loginCR = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    return data;
  } else {
    throw new Error(data.message);
  }
};

// Protected API call
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

## 📦 All Environment Variables

```env
CR_EMAIL=cse1.cr@gmail.com
CR_PASSWORD=$2a$10$IjVAe8yCDGcrNJFF8D3mfOgEy0yxaktsy3FC9sfqKOhhQzPugjVAi
JWT_SECRET=supersecretkey
PORT=5000
```

---

🎉 **Backend is complete and ready to use!**
