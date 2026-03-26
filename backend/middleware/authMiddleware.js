const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // MOCK FOR DEMO: If frontend sends a specific mock token, accept it.
      if (token === 'mock-jwt-token') {
        req.user = { id: 'mockUserId123', isAdmin: false };
        return next();
      }
      if (token === 'mock-jwt-admin-token') {
        req.user = { id: 'mockAdminId123', isAdmin: true };
        return next();
      }

      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const loadUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (token === 'mock-jwt-token') {
        req.user = { id: 'mockUserId123', isAdmin: false };
        return next();
      }
      if (token === 'mock-jwt-admin-token') {
        req.user = { id: 'mockAdminId123', isAdmin: true };
        return next();
      }

      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      // Don't block, just don't set req.user
      next();
    }
  } else {
    next();
  }
};

module.exports = { protect, admin, loadUser };
