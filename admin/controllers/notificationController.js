const User = require('../../models/User');
const Notification =
  require('../../models/Notification');

const {
  sendPushNotification,
} = require('../../services/pushService');


exports.sendSubscriptionReminder =
async (req, res) => {

  try {

    const users =
      await User.find({
        role: 'user',
      });

    const tokens =
      users.flatMap(
        (u) => u.fcmTokens || []
      );

    if (!tokens.length) {

      return res.status(400).json({
        message:
          'No active device tokens',
      });
    }

    const title =
      'Milk delivery locks at 5 PM';

    const body =
      'Tomorrow milk quantity will lock at 5 PM. Edit quantity before 5 PM if needed.';

    await sendPushNotification({
      tokens,
      title,
      body,
    });

    const docs = users.map((u) => ({
      userId: u._id,
      title,
      body,
      type: 'subscription',
    }));

    await Notification.insertMany(
      docs,
    );

    res.json({
      success: true,
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message:
        'Failed to send notification',
    });
  }
};