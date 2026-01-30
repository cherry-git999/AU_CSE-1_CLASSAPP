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

    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCREmail = CR_EMAIL.trim().toLowerCase();

    // Compare email with environment variable
    if (normalizedEmail !== normalizedCREmail) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Compare password - PLAIN TEXT (no bcrypt)
    if (password !== CR_PASSWORD) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token with 8-hour expiry
    const token = jwt.sign(
      { role: 'CR', email: CR_EMAIL },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Send response
    res.status(200).json({
      token,
      user: {
        email: CR_EMAIL,
        role: 'CR'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
};
