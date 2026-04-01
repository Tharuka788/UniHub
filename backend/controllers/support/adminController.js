const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/support/Admin');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/support/admin/login
// @access  Public
const authAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check for admin username
    const admin = await Admin.findOne({ username });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin.id,
        username: admin.username,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register a new admin (Used for initial setup)
// @route   POST /api/support/admin/register
// @access  Public (Should be restricted in production)
const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if admin exists
    const adminExists = await Admin.findOne({ username });

    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await Admin.create({
      username,
      password: hashedPassword,
    });

    if (admin) {
      res.status(201).json({
        _id: admin.id,
        username: admin.username,
        token: generateToken(admin._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authAdmin,
  registerAdmin
};
