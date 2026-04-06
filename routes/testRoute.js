const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { 
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
} = require('../controllers/testController');

// Auth routes
router.post('/auth/login', loginUser);
router.post('/auth/register', registerUser);

// Temporary aliases for backward compatibility
router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/health', (req, res) => {
    return res.status(200).json({ status: 'ok' });
});

// Client routes
router.post('/clients', authMiddleware, addClient);
router.get('/clients', authMiddleware, getClients);
router.get('/clients/:id', authMiddleware, getClient);
router.put('/clients/:id', authMiddleware, updateClient);
router.delete('/clients/:id', authMiddleware, deleteClient);

// Project routes
router.post('/projects', authMiddleware, addProject);
router.get('/projects', authMiddleware, getProjects);
router.get('/projects/:id', authMiddleware, getProject);
router.put('/projects/:id', authMiddleware, updateProject);
router.delete('/projects/:id', authMiddleware, deleteProject);

// Payment routes
router.post('/payments', authMiddleware, addPayment);
router.get('/payments', authMiddleware, getPayments);
router.get('/payments/:id', authMiddleware, getPayment);
router.put('/payments/:id', authMiddleware, updatePayment);
router.delete('/payments/:id', authMiddleware, deletePayment);

// Analytics routes
router.get('/analytics/total', authMiddleware, getTotalEarnings);
router.get('/analytics/monthly', authMiddleware, getMonthlyEarnings);
router.get('/analytics/client-wise', authMiddleware, getClientWiseEarnings);
router.get('/analytics/project-status', authMiddleware, getProjectStatusSummary);

// Dashboard route
router.get('/dashboard', authMiddleware, getDashboardData);

// Test route
router.get('/test', authMiddleware, testMessage);

module.exports = router;
