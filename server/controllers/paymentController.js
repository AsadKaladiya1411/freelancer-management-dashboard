const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createPayment = asyncHandler(async (req, res) => {
  const { project, client, amount, paymentDate, paymentMethod, status, invoiceNumber, notes } = req.body;
  const payment = await Payment.create({
    user: req.user._id, project, client, amount, paymentDate, paymentMethod, status, invoiceNumber, notes,
  });
  await payment.populate([
    { path: 'project', select: 'title' },
    { path: 'client', select: 'name company' },
  ]);
  res.status(201).json(new ApiResponse(201, { payment }, 'Payment recorded successfully'));
});

const getPayments = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  const { page = 1, limit = 20, search = '', project, client, status, startDate, endDate, sort = '-paymentDate' } = req.query;
  const query = { user: req.user._id };
  if (project) query.project = project;
  if (client) query.client = client;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.paymentDate = {};
    if (startDate) query.paymentDate.$gte = new Date(startDate);
    if (endDate) query.paymentDate.$lte = new Date(endDate);
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('project', 'title').populate('client', 'name company')
    .sort(sort).skip(skip).limit(parseInt(limit));

  // Build a clean aggregation match with proper ObjectId types for Atlas
  const aggMatch = { user: new mongoose.Types.ObjectId(req.user._id), status: 'completed' };
  if (project) aggMatch.project = new mongoose.Types.ObjectId(project);
  if (client) aggMatch.client = new mongoose.Types.ObjectId(client);
  if (startDate || endDate) {
    aggMatch.paymentDate = {};
    if (startDate) aggMatch.paymentDate.$gte = new Date(startDate);
    if (endDate) aggMatch.paymentDate.$lte = new Date(endDate);
  }

  const totalAmountResult = await Payment.aggregate([
    { $match: aggMatch },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
  res.json(new ApiResponse(200, {
    payments, totalAmount,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  }, 'Payments fetched'));
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, user: req.user._id })
    .populate('project', 'title budget').populate('client', 'name company email');
  if (!payment) throw new ApiError(404, 'Payment not found');
  res.json(new ApiResponse(200, { payment }, 'Payment fetched'));
});

const updatePayment = asyncHandler(async (req, res) => {
  const { amount, paymentDate, paymentMethod, status, invoiceNumber, notes, project, client } = req.body;
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { amount, paymentDate, paymentMethod, status, invoiceNumber, notes, project, client },
    { new: true, runValidators: true }
  ).populate('project', 'title').populate('client', 'name company');
  if (!payment) throw new ApiError(404, 'Payment not found');
  res.json(new ApiResponse(200, { payment }, 'Payment updated successfully'));
});

const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!payment) throw new ApiError(404, 'Payment not found');
  res.json(new ApiResponse(200, null, 'Payment deleted successfully'));
});

module.exports = { createPayment, getPayments, getPayment, updatePayment, deletePayment };
