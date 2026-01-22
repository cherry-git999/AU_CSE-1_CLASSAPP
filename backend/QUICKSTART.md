# 🚀 Quick Reference - CR Authentication Backend

## Start Server
```bash
cd backend
npm install
npm run dev
```
Server: `http://localhost:5000`

## Login Credentials
```
Email: cse1.cr@gmail.com
Password: StrongPassword123
```

## API Endpoints

### Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "cse1.cr@gmail.com",
  "password": "StrongPassword123"
}
```
**Returns:** `{ token: "...", role: "CR" }`

### Protected Route (Example)
```http
GET http://localhost:5000/api/auth/protected
Authorization: Bearer YOUR_TOKEN_HERE
```

## Use in Frontend
```javascript
// Login
const { token, role } = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'cse1.cr@gmail.com', 
    password: 'StrongPassword123' 
  })
}).then(r => r.json());

// Store token
localStorage.setItem('token', token);

// Protected request
fetch('http://localhost:5000/api/auth/protected', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Protect New Routes
```javascript
import { protectCR } from '../middleware/authMiddleware.js';

router.get('/your-route', protectCR, (req, res) => {
  // Only accessible with valid CR token
  res.json({ data: 'protected' });
});
```

## Files Created
- ✅ server.js - Express app
- ✅ authController.js - Login logic
- ✅ authRoutes.js - Routes
- ✅ authMiddleware.js - JWT protection
- ✅ .env - Credentials
- ✅ package.json - Dependencies

## Environment Variables
```env
CR_EMAIL=cse1.cr@gmail.com
CR_PASSWORD=$2a$10$IjVAe8yCDGcrNJFF8D3mfOgEy0yxaktsy3FC9sfqKOhhQzPugjVAi
JWT_SECRET=supersecretkey
PORT=5000
```

## Error Responses
- `400` - Missing email/password
- `401` - Invalid credentials or expired token
- `403` - Not a CR role
- `500` - Server error

---
📖 Full docs: [README.md](README.md) | [TEST_GUIDE.md](TEST_GUIDE.md) | [COMPLETE.md](COMPLETE.md)
