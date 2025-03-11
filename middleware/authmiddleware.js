const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    
    const statusCode = (error.name === 'JsonWebTokenError' || 
                      error.name === 'TokenExpiredError') ? 401 : 500;
    res.status(statusCode).json({ 
      message: error.message || 'Authentication failed' 
    });
  }
};

module.exports = auth;