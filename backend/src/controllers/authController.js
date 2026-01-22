import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * CR Login Controller
 * Authenticates CR using environment variables (NO database)
 */
export const loginCR = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Get CR credentials from environment variables
    const CR_EMAIL = process.env.CR_EMAIL;
    const CR_PASSWORD = process.env.CR_PASSWORD;
    const JWT_SECRET = process.env.JWT_SECRET;

    // Check if environment variables are set
    if (!CR_EMAIL || !CR_PASSWORD || !JWT_SECRET) {
      return res.status(500).json({ 
        message: 'Server configuration error' 
      });
    }

    // Compare email with environment variable
    if (email !== CR_EMAIL) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, CR_PASSWORD);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token with 8-hour expiry
    const token = jwt.sign(
      { role: 'CR' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Send response
    res.status(200).json({
      token,
      role: 'CR'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
};
