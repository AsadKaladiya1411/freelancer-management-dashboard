const Client = require('../models/Client');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new client
 * @route   POST /api/clients
 * @access  Private
 */
const createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, status, notes, tags } = req.body;

  const client = await Client.create({
    user: req.user._id,
    name,
    email,
    phone,
    company,
    address,
    status,
    notes,
    tags,
  });

  res.status(201).json(
    new ApiResponse(201, { client }, 'Client created successfully')
  );
});

/**
 * @desc    Get all clients for logged-in user
 * @route   GET /api/clients
 * @access  Private
 */
const getClients = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status,
    sort = '-createdAt',
  } = req.query;

  const query = { user: req.user._id };

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Client.countDocuments(query);

  const clients = await Client.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.json(
    new ApiResponse(200, {
      clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Clients fetched')
  );
});

/**
 * @desc    Get single client
 * @route   GET /api/clients/:id
 * @access  Private
 */
const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  res.json(new ApiResponse(200, { client }, 'Client fetched'));
});

/**
 * @desc    Update client
 * @route   PUT /api/clients/:id
 * @access  Private
 */
const updateClient = asyncHandler(async (req, res) => {
  const { name, email, phone, company, address, status, notes, tags } = req.body;

  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { name, email, phone, company, address, status, notes, tags },
    { new: true, runValidators: true }
  );

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  res.json(new ApiResponse(200, { client }, 'Client updated successfully'));
});

/**
 * @desc    Delete client (cascade: removes related projects & payments)
 * @route   DELETE /api/clients/:id
 * @access  Private
 */
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  // Cascade delete: remove all related projects and payments
  const projects = await Project.find({ client: client._id });
  const projectIds = projects.map((p) => p._id);

  await Payment.deleteMany({ project: { $in: projectIds } });
  await Project.deleteMany({ client: client._id });
  await Client.findByIdAndDelete(client._id);

  res.json(new ApiResponse(200, null, 'Client and related data deleted successfully'));
});

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
};
