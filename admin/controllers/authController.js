const admin = require('../../config/firebase');
const User = require('../../models/User');
const generateToken = require('../../utils/generateToken');

// POST /api/admin/auth/login  — Firebase ID token login, admin only
exports.adminLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }

    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/auth/me
exports.me = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
