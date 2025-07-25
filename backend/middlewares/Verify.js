const jwt = require('jsonwebtoken');
// This ensures the middleware uses the same secret as your login/signup routes.
const SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Access Denied: No token provided' });
    }

    // Verify the token using the secret from your .env file
    const verified = jwt.verify(token, SECRET);
    req.userId = verified.id;
    next();

  } catch (err) {
    // This will catch expired tokens, malformed tokens, etc.
    res.status(401).json({ message: 'Invalid or Expired Token' });
  }
};

module.exports = verifyToken;