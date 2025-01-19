const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Get token from the Authorization header
  const token = authHeader && authHeader.split(' ')[1]; // Split 'Bearer TOKEN'

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err.message); // Debug log for errors
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    console.log("Decoded token payload:", user);
    req.user = user; // Store user info from the token in the request object

    // Additional check to ensure req.user is set
    if (!req.user) {
      return res.status(500).json({ message: 'Failed to set user from token' });
    }
    
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
