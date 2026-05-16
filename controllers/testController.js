const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Payment = require('../models/Payment');

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

  try {
    // check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create new user
    const newUser = await User.create({
      name,
      email,
      password
    });

    res.json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // check password
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      userId: user._id,
      name: user.name
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Add client
const addClient = async (req, res) => {
  const { user_id, name, email, phone, company } = req.body;

  if (!user_id || !name) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const newClient = await Client.create({
      user_id,
      name,
      email,
      phone,
      company
    });

    res.json({
      message: "Client added successfully",
      client: newClient
    });

  } catch (error) {
  console.log(error);   // 👈 ADD THIS LINE
  res.status(500).json({ message: "Server error" });
}
};
// Add project
const addProject = async (req, res) => {
  const { user_id, client_id, title, budget, deadline, status } = req.body;

  if (!user_id || !client_id || !title) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const newProject = await Project.create({
      user_id,
      client_id,
      title,
      budget,
      deadline,
      status
    });

    res.json({
      message: "Project added successfully",
      project: newProject
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Add payment
const addPayment = async (req, res) => {
  const { user_id, project_id, amount, payment_date } = req.body;

  if (!user_id || !project_id || !amount || !payment_date) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const payment = await Payment.create({
      user_id,
      project_id,
      amount,
      payment_date
    });

    res.json({
      message: "Payment added successfully",
      payment
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
// 1) Total earnings
const getTotalEarnings = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const result = await Payment.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id)
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
    console.log("Analytics Error:", error); // 👈 important
    res.status(500).json({ message: "Server error" });
  }
};
// 2) Monthly earnings
const getMonthlyEarnings = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const result = await Payment.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id)
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
    console.log("Monthly Analytics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3) Client-wise earnings
const getClientWiseEarnings = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const result = await Payment.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id)
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
    console.log("Client Analytics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// 4) Project status summary
const getProjectStatusSummary = (req, res) => {
    const { user_id } = req.query;

    const sql = `
        SELECT status, COUNT(*) AS count
        FROM projects
        WHERE user_id = ?
        GROUP BY status
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
};
// Dashboard data
const getDashboardData = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const objectId = new mongoose.Types.ObjectId(user_id);

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
    console.log("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all clients
const getClients = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const clients = await Client.find({ user_id }).sort({ createdAt: -1 });
    res.json({ clients });

  } catch (error) {
    console.log("Get Clients Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single client
const getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ client });

  } catch (error) {
    console.log("Get Client Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company } = req.body;

    const client = await Client.findByIdAndUpdate(
      id,
      { name, email, phone, company },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({
      message: "Client updated successfully",
      client
    });

  } catch (error) {
    console.log("Update Client Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deleted successfully" });

  } catch (error) {
    console.log("Delete Client Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const projects = await Project.find({ user_id })
      .populate('client_id', 'name company')
      .sort({ createdAt: -1 });
    
    res.json({ projects });

  } catch (error) {
    console.log("Get Projects Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single project
const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate('client_id', 'name company');
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });

  } catch (error) {
    console.log("Get Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, budget, deadline, status, client_id } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { title, budget, deadline, status, client_id },
      { new: true }
    ).populate('client_id', 'name company');

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project updated successfully",
      project
    });

  } catch (error) {
    console.log("Update Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });

  } catch (error) {
    console.log("Delete Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all payments
const getPayments = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const payments = await Payment.find({ user_id })
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
    console.log("Get Payments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single payment
const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
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
    console.log("Get Payment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_date, project_id } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      { amount, payment_date, project_id },
      { new: true }
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
    console.log("Update Payment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });

  } catch (error) {
    console.log("Delete Payment Error:", error);
    res.status(500).json({ message: "Server error" });
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
