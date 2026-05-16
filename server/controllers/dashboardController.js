const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const objectId = new mongoose.Types.ObjectId(userId);

  // Run all queries in parallel
  const [totalEarningsResult, totalClients, totalProjects, monthlyEarnings, clientWiseEarnings, projectsByStatus, recentPayments, overdueProjects, unreadNotifications] = await Promise.all([
    Payment.aggregate([
      { $match: { user: objectId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Client.countDocuments({ user: userId }),
    Project.countDocuments({ user: userId }),
    Payment.aggregate([
      { $match: { user: objectId, status: 'completed' } },
      { $group: { _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Payment.aggregate([
      { $match: { user: objectId, status: 'completed' } },
      { $lookup: { from: 'projects', localField: 'project', foreignField: '_id', as: 'projectData' } },
      { $unwind: '$projectData' },
      { $lookup: { from: 'clients', localField: 'projectData.client', foreignField: '_id', as: 'clientData' } },
      { $unwind: '$clientData' },
      { $group: { _id: '$clientData.name', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    Project.aggregate([
      { $match: { user: objectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Payment.find({ user: userId }).populate('project', 'title').populate('client', 'name').sort({ paymentDate: -1 }).limit(5),
    Project.find({ user: userId, deadline: { $lt: new Date() }, status: { $nin: ['completed', 'cancelled'] } }).populate('client', 'name').limit(5),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  res.json(new ApiResponse(200, {
    totalEarnings: totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0,
    totalClients,
    totalProjects,
    monthlyEarnings: monthlyEarnings.map(m => ({ month: m._id.month, year: m._id.year, total: m.total })),
    clientWiseEarnings: clientWiseEarnings.map(c => ({ clientName: c._id, total: c.total })),
    projectsByStatus: projectsByStatus.map(p => ({ status: p._id, count: p.count })),
    recentPayments,
    overdueProjects,
    unreadNotifications,
  }, 'Dashboard data fetched'));
});

// Notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Notification.countDocuments({ user: req.user._id });
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json(new ApiResponse(200, {
    notifications, unread,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  }, 'Notifications fetched'));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
  res.json(new ApiResponse(200, null, 'Notification marked as read'));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json(new ApiResponse(200, null, 'All notifications marked as read'));
});

module.exports = { getDashboard, getNotifications, markNotificationRead, markAllNotificationsRead };
