const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Payment = require('../models/Payment');

const createToken = (userId) => jwt.sign(
  { userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeEmail = (email) => email.trim().toLowerCase();

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(value);

const findUserByEmail = (email) => User.findOne({
  email: new RegExp(`^${escapeRegex(email)}$`, 'i')
});

const verifyPassword = async (user, password) => {
  if (await bcrypt.compare(password, user.password)) {
    return true;
  }

  if (isBcryptHash(user.password)) {
    return false;
  }

  if (password !== user.password) {
    return false;
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();
  return true;
};

const handleServerError = (res, label, error) => {
  console.log(`${label}:`, error);
  return res.status(500).json({ message: 'Server error' });
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getUserObjectId = (userId) => new mongoose.Types.ObjectId(userId);

// Controller function
const testMessage = (req, res) => {
    res.json({
        message: "Controller working successfully"
    });
};
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName || !normalizedEmail || !password.trim()) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    // check if user already exists
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    return handleServerError(res, 'Register User Error', error);
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    // find user by email
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // check password
    const passwordMatches = await verifyPassword(user, password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.email !== normalizedEmail) {
      user.email = normalizedEmail;
      await user.save();
    }

    const token = createToken(user._id.toString());

    res.json({
      message: "Login successful",
      token,
      userId: user._id,
      name: user.name,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    return handleServerError(res, 'Login User Error', error);
  }
};
// Add client
const addClient = async (req, res) => {
  const { name, email, phone, company } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const newClient = await Client.create({
      user_id: req.userId,
      name,
      email,
      phone,
      company
    });

    res.status(201).json({
      message: "Client added successfully",
      client: newClient
    });

  } catch (error) {
    return handleServerError(res, 'Add Client Error', error);
  }
};
// Add project
const addProject = async (req, res) => {
  const { client_id, title, budget, deadline, status } = req.body;

  if (!client_id || !title) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const client = await Client.findOne({ _id: client_id, user_id: req.userId });

    if (!client) {
      return res.status(400).json({ message: 'Invalid client selected' });
    }

    const newProject = await Project.create({
      user_id: req.userId,
      client_id,
      title,
      budget,
      deadline,
      status
    });

    res.status(201).json({
      message: "Project added successfully",
      project: newProject
    });

  } catch (error) {
    return handleServerError(res, 'Add Project Error', error);
  }
};
// Add payment
const addPayment = async (req, res) => {
  const { project_id, amount, payment_date } = req.body;

  if (!project_id || !amount || !payment_date) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const project = await Project.findOne({ _id: project_id, user_id: req.userId });

    if (!project) {
      return res.status(400).json({ message: 'Invalid project selected' });
    }

    const payment = await Payment.create({
      user_id: req.userId,
      project_id,
      amount,
      payment_date
    });

    res.status(201).json({
      message: "Payment added successfully",
      payment
    });

  } catch (error) {
    return handleServerError(res, 'Add Payment Error', error);
  }
};
// 1) Total earnings
const getTotalEarnings = async (req, res) => {
  try {
    const userObjectId = getUserObjectId(req.userId);

    const result = await Payment.aggregate([
      {
        $match: {
          user_id: userObjectId
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json({
      totalEarnings: result.length > 0 ? result[0].total : 0
    });

  } catch (error) {
    return handleServerError(res, 'Total Earnings Error', error);
  }
};
// 2) Monthly earnings
const getMonthlyEarnings = async (req, res) => {
  try {
    const userObjectId = getUserObjectId(req.userId);

    const result = await Payment.aggregate([
      {
        $match: {
          user_id: userObjectId
        }
      },
      {
        $group: {
          _id: { $month: "$payment_date" },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    res.json(result);

  } catch (error) {
    return handleServerError(res, 'Monthly Earnings Error', error);
  }
};

// 3) Client-wise earnings
const getClientWiseEarnings = async (req, res) => {
  try {
    const userObjectId = getUserObjectId(req.userId);

    const result = await Payment.aggregate([
      {
        $match: {
          user_id: userObjectId
        }
      },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project"
        }
      },
      { $unwind: "$project" },
      {
        $lookup: {
          from: "clients",
          localField: "project.client_id",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      {
        $group: {
          _id: "$client.name",
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json(result);

  } catch (error) {
    return handleServerError(res, 'Client Wise Earnings Error', error);
  }
};
// 4) Project status summary
const getProjectStatusSummary = async (req, res) => {
  try {
    const userObjectId = getUserObjectId(req.userId);

    const result = await Project.aggregate([
      {
        $match: {
          user_id: userObjectId
        }
      },
      {
        $group: {
          _id: { $toLower: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      pending: 0,
      'in progress': 0,
      'on hold': 0,
      completed: 0
    };

    result.reduce((accumulator, item) => {
      const statusKey = (item._id || 'unknown').toLowerCase();
      accumulator[statusKey] = item.count;
      return accumulator;
    }, summary);

    return res.json(summary);
  } catch (error) {
    return handleServerError(res, 'Project Status Summary Error', error);
  }
};
// Dashboard data
const getDashboardData = async (req, res) => {
  try {
    const objectId = getUserObjectId(req.userId);

    // Total Earnings
    const total = await Payment.aggregate([
      { $match: { user_id: objectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Monthly Earnings
    const monthly = await Payment.aggregate([
      { $match: { user_id: objectId } },
      {
        $group: {
          _id: { $month: "$payment_date" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Client-wise Earnings
    const clientWise = await Payment.aggregate([
      { $match: { user_id: objectId } },
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project"
        }
      },
      { $unwind: "$project" },
      {
        $lookup: {
          from: "clients",
          localField: "project.client_id",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      {
        $group: {
          _id: "$client.name",
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Total Clients
    const totalClients = await Client.countDocuments({ user_id: objectId });

    // Total Projects
    const totalProjects = await Project.countDocuments({ user_id: objectId });

    // Monthly Earnings with year
    const monthlyWithYear = await Payment.aggregate([
      { $match: { user_id: objectId } },
      {
        $group: {
          _id: { month: { $month: "$payment_date" }, year: { $year: "$payment_date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Client-wise with proper format
    const clientWiseFormatted = clientWise.map(item => ({
      clientName: item._id,
      total: item.total
    }));

    res.json({
      totalEarnings: total[0]?.total || 0,
      totalClients,
      totalProjects,
      monthlyEarnings: monthlyWithYear,
      clientWiseEarnings: clientWiseFormatted
    });

  } catch (error) {
    return handleServerError(res, 'Dashboard Error', error);
  }
};

// Get all clients
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user_id: req.userId }).sort({ createdAt: -1 });
    res.json({ clients });

  } catch (error) {
    return handleServerError(res, 'Get Clients Error', error);
  }
};

// Get single client
const getClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = await Client.findOne({ _id: id, user_id: req.userId });
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ client });

  } catch (error) {
    return handleServerError(res, 'Get Client Error', error);
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = await Client.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      { name, email, phone, company },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({
      message: "Client updated successfully",
      client
    });

  } catch (error) {
    return handleServerError(res, 'Update Client Error', error);
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const client = await Client.findOneAndDelete({ _id: id, user_id: req.userId });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deleted successfully" });

  } catch (error) {
    return handleServerError(res, 'Delete Client Error', error);
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user_id: req.userId })
      .populate('client_id', 'name company')
      .sort({ createdAt: -1 });
    
    res.json({ projects });

  } catch (error) {
    return handleServerError(res, 'Get Projects Error', error);
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = await Project.findOne({ _id: id, user_id: req.userId }).populate('client_id', 'name company');
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });

  } catch (error) {
    return handleServerError(res, 'Get Project Error', error);
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, budget, deadline, status, client_id } = req.body;

    if (!client_id) {
      return res.status(400).json({ message: 'Client is required' });
    }

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const client = await Client.findOne({ _id: client_id, user_id: req.userId });

    if (!client) {
      return res.status(400).json({ message: 'Invalid client selected' });
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      { title, budget, deadline, status, client_id },
      { new: true, runValidators: true }
    ).populate('client_id', 'name company');

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project updated successfully",
      project
    });

  } catch (error) {
    return handleServerError(res, 'Update Project Error', error);
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const project = await Project.findOneAndDelete({ _id: id, user_id: req.userId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });

  } catch (error) {
    return handleServerError(res, 'Delete Project Error', error);
  }
};

// Get all payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.userId })
      .populate({
        path: 'project_id',
        select: 'title',
        populate: {
          path: 'client_id',
          select: 'name'
        }
      })
      .sort({ payment_date: -1 });
    
    res.json({ payments });

  } catch (error) {
    return handleServerError(res, 'Get Payments Error', error);
  }
};

// Get single payment
const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = await Payment.findOne({ _id: id, user_id: req.userId })
      .populate({
        path: 'project_id',
        select: 'title',
        populate: {
          path: 'client_id',
          select: 'name'
        }
      });
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment });

  } catch (error) {
    return handleServerError(res, 'Get Payment Error', error);
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_date, project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({ message: 'Project is required' });
    }

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const project = await Project.findOne({ _id: project_id, user_id: req.userId });

    if (!project) {
      return res.status(400).json({ message: 'Invalid project selected' });
    }

    const payment = await Payment.findOneAndUpdate(
      { _id: id, user_id: req.userId },
      { amount, payment_date, project_id },
      { new: true, runValidators: true }
    ).populate({
      path: 'project_id',
      select: 'title',
      populate: {
        path: 'client_id',
        select: 'name'
      }
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      message: "Payment updated successfully",
      payment
    });

  } catch (error) {
    return handleServerError(res, 'Update Payment Error', error);
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const payment = await Payment.findOneAndDelete({ _id: id, user_id: req.userId });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });

  } catch (error) {
    return handleServerError(res, 'Delete Payment Error', error);
  }
};

module.exports = {
    testMessage,
    registerUser,
    loginUser,
    addClient,
    addProject,
    addPayment,
    getTotalEarnings,
    getMonthlyEarnings,
    getClientWiseEarnings,
    getProjectStatusSummary,
    getDashboardData,
    getClients,
    getClient,
    updateClient,
    deleteClient,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    getPayments,
    getPayment,
    updatePayment,
    deletePayment
};
