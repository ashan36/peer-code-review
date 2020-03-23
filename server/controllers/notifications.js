const { Notification, User } = require("../database");
const io = require("../services/socketService");

const createNotification = async data => {
  const { recipient, event, origin, thread } = data;
  const originDoc = await User.findById(origin);
  const newNotification = await new Notification({
    recipient,
    event: Number(event),
    origin: originDoc.name,
    thread
  });
  const notification = await newNotification.save();
  io.sendNotification(recipient, generateNotificationData(notification));
  return notification;
};

const updateNotifications = async notifications => {
  notifications.forEach(async notification => {
    const current = await Notification.findById(notification._id);
    current.seen = true;
    current.save();
  });
};

const getUsersNotifications = async recipient => {
  const notifications = await Notification.find({ recipient });

  const notificationData = notifications.map(notification => {
    return generateNotificationData(notification);
  });
  return notificationData;
};

const generateNotificationData = notification => {
  var result = {};
  result._id = notification._id;
  result.seen = notification.seen;
  result.createdAt = notification.createdAt;

  switch (notification.event) {
    case 1:
      result.link = `/dashboard/requests/${notification.thread}`;
      result.message = `Your code has been reviewed by ${notification.origin}`;
      break;
    case 2:
      result.link = `/dashboard/assigned/${notification.thread}`;
      result.message = `You have been assigned code to review for ${notification.origin}`;
      break;
    case 3:
      result.link = `/dashboard/requests/${notification.thread}`;
      result.message = `A thread you are in has a new post by ${notification.origin}`;
      break;
    case 4:
      result.link = `/dashboard/reviews/${notification.thread}`;
      result.message = `A thread you are in has a new post by ${notification.origin}`;
      break;
    case 5:
      result.link = `/dashboard/reviews/${notification.thread}`;
      result.message = `${notification.origin} has rated your review`;
      break;
    default:
      result.link = "";
      result.message = null;
  }
  return result;
};

module.exports = {
  createNotification,
  getUsersNotifications,
  updateNotifications
};
