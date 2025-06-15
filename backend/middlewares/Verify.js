const jwt = require('jsonwebtoken');
const SECRET = 'im very shy because andhe ne movie dekhi aur gunge ne gaana gaya';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, SECRET);
    req.userId = verified.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = verifyToken;
