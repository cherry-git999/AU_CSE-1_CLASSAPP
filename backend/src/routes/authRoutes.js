import express from 'express';
import { loginCR } from '../controllers/authController.js';
import { protectCR } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    CR login using environment variables
 * @access  Public
 */
router.post('/login', loginCR);

/**
 * @route   GET /api/auth/protected
 * @desc    Example protected route for testing
 * @access  Protected (CR only)
 */
router.get('/protected', protectCR, (req, res) => {
  res.json({ 
    message: 'Access granted! You are authenticated as CR.',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

export default router;
