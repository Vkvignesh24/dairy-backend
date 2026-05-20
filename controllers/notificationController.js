const Notification = require('../models/Notification');

exports.myNotifications = async (req, res) => {

  try {

    const notifications =
      await Notification.find({
        userId: req.user._id,
      })
        .sort({
          createdAt: -1,
        });

    res.json({
      notifications,
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message:
        'Failed to fetch notifications',
    });
  }
};

exports.markAllAsRead = async (req, res) => {

  try {

    await Notification.updateMany(
      {
        userId: req.user._id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      },
    );

    res.json({
      success: true,
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message:
        'Failed to mark notifications as read',
    });
  }
};