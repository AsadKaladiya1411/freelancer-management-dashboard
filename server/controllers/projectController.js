const Project = require('../models/Project');
const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = asyncHandler(async (req, res) => {
  const { title, description, client, budget, deadline, startDate, status, priority, tags, milestones } = req.body;

  const project = await Project.create({
    user: req.user._id,
    title,
    description,
    client,
    budget,
    deadline,
    startDate,
    status,
    priority,
    tags,
    milestones,
  });

  // Populate client info before returning
  await project.populate('client', 'name company');

  res.status(201).json(
    new ApiResponse(201, { project }, 'Project created successfully')
  );
});

/**
 * @desc    Get all projects for logged-in user
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status,
    priority,
    client,
    sort = '-createdAt',
  } = req.query;

  const query = { user: req.user._id };

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Status filter
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (client) query.client = client;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Project.countDocuments(query);

  const projects = await Project.find(query)
    .populate('client', 'name company')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.json(
    new ApiResponse(200, {
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Projects fetched')
  );
});

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('client', 'name company email phone');

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  res.json(new ApiResponse(200, { project }, 'Project fetched'));
});

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = asyncHandler(async (req, res) => {
  const { title, description, client, budget, deadline, startDate, status, priority, tags, milestones } = req.body;

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { title, description, client, budget, deadline, startDate, status, priority, tags, milestones },
    { new: true, runValidators: true }
  ).populate('client', 'name company');

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  res.json(new ApiResponse(200, { project }, 'Project updated successfully'));
});

/**
 * @desc    Delete project (cascade: removes related payments)
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Cascade delete related payments
  await Payment.deleteMany({ project: project._id });
  await Project.findByIdAndDelete(project._id);

  res.json(new ApiResponse(200, null, 'Project and related payments deleted'));
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
