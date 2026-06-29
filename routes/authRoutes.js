const router = require('express').Router();
// const { firebaseLogin, me, updateProfile, saveFcmToken, removeFcmToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  firebaseLogin,
  me,
  updateProfile,
  saveFcmToken,
  removeFcmToken,
} = require('../controllers/authController');

const {
  uploadHouseImages,
} = require('../controllers/uploadController');


router.post('/firebase-login', firebaseLogin);
router.get('/me', protect, me);
router.post(

  '/upload-house-images',

  protect,

  upload.array('images', 3),

  uploadHouseImages,

);
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
