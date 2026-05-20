const router = require('express').Router();
const { firebaseLogin, me, updateProfile, saveFcmToken, removeFcmToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);


router.post(
  '/save-fcm-token',
  protect,
  saveFcmToken
);

router.post(
  '/remove-fcm-token',
  protect,
  removeFcmToken
);

module.exports = router;
