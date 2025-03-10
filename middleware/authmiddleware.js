const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);

    const statusCode = (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') ? 401 : 500;
    res.status(statusCode).json({ message: 'Please authenticate' });
  }
};
module.exports = auth;
