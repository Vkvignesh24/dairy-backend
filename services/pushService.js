const admin =
require('../config/firebase');

const User =
require('../models/User');

async function sendPushNotification({
  tokens,
  title,
  body,
  data = {},
}) {

  if (!tokens?.length) {
    return;
  }

  const response =
    await admin.messaging()
      .sendEachForMulticast({

    tokens,

    notification: {
      title,
      body,
    },

    data,

    android: {
      priority: 'high',
    },

    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
  });

  // REMOVE INVALID TOKENS
  const invalidTokens = [];

  response.responses.forEach(
    (r, i) => {

    if (!r.success) {

      invalidTokens.push(
        tokens[i]
      );
    }
  });

  if (invalidTokens.length) {

    await User.updateMany(
      {},
      {
        $pull: {
          fcmTokens: {
            $in: invalidTokens,
          },
        },
      },
    );
  }
}

module.exports = {
  sendPushNotification,
};