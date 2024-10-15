const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Get token from the Authorization header
  const token = authHeader && authHeader.split(' ')[1]; // Split 'Bearer TOKEN'

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = user; // Store user info from the token in the request object
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authenticateToken;
