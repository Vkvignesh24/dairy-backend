const admin = require('../config/firebase');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/firebase-login
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken, name, phone, address, isSignup } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Authentication token is missing.' });

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ message: 'Session expired or invalid. Please try again.' });
    }

    const { uid, email } = decoded;
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // STRICT RULE: If they are trying to log in but don't exist, block them.
      if (!isSignup) {
        return res.status(404).json({ message: 'Account not found. Please sign up first.' });
      }

      // STRICT RULE: Signup requires all fields
      if (!phone || !address || !name) {
        return res.status(400).json({ message: 'Name, Phone, and Full Address are mandatory for registration.' });
      }

      user = await User.create({
        firebaseUid: uid,
        email: email || '',
        name: name,
        phone: phone,
        address: address,
      });
    } else {
      // Light update if user updates details (optional)
      let dirty = false;
      if (name && user.name !== name) { user.name = name; dirty = true; }
      if (phone && user.phone !== phone) { user.phone = phone; dirty = true; }
      if (address && user.address !== address) { user.address = address; dirty = true; }
      if (dirty) await user.save();
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address, // Include address in payload
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(500).json({ message: 'A server error occurred. Please try again.' });
  }
};

// GET /api/auth/me  (protected)
exports.me = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      address: req.user.address,
      role: req.user.role,
    },
  });
};

// PUT /api/auth/profile (protected)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = req.user; // Injected by 'protect' middleware

    // 1. Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Please enter a valid name' });
    }
    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ message: 'Enter a valid 10-digit phone number' });
    }
    if (!address || address.trim().length < 10) {
      return res.status(400).json({ message: 'Please provide a full delivery address' });
    }

    // 2. Update User Document
    user.name = name.trim();
    user.phone = phone.trim();
    user.address = address.trim();

    await user.save();

    // 3. Return updated user
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: Failed to update profile' });
  }
};

// exports.saveFcmToken = async (req, res) => {
//   try {

//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({
//         message: 'Token required',
//       });
//     }

//     const user = req.user;

//     if (!user.fcmTokens.includes(token)) {
//       user.fcmTokens.push(token);
//       await user.save();
//     }

//     res.json({
//       success: true,
//     });

//   } catch (e) {

//     res.status(500).json({
//       message: 'Failed to save token',
//     });
//   }
// };

exports.saveFcmToken =
  async (req, res) => {

    try {

      const { token } = req.body;

      if (!token) {

        return res.status(400).json({
          message: 'Token required',
        });
      }

      const user = await User.findById(
        req.user._id
      );

      if (!user) {

        return res.status(404).json({
          message: 'User not found',
        });
      }

      // AVOID DUPLICATES
      if (
        !user.fcmTokens.includes(token)
      ) {

        user.fcmTokens.push(token);

        await user.save();
      }

      res.json({
        success: true,
      });

    } catch (e) {

      res.status(500).json({
        message: 'Failed to save token',
      });
    }
  };

exports.removeFcmToken = async (req, res) => {

  try {

    const { token } = req.body;

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          fcmTokens: token,
        },
      },
    );

    res.json({
      success: true,
    });

  } catch (e) {

    res.status(500).json({
      message: 'Failed to remove token',
    });
  }
};

