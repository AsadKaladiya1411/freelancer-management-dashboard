const express = require('express');
const router = express.Router();

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
router.post('/register', registerUser);
router.post('/login', loginUser);

// Client routes
router.post('/clients', addClient);
router.get('/clients', getClients);
router.get('/clients/:id', getClient);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

// Project routes
router.post('/projects', addProject);
router.get('/projects', getProjects);
router.get('/projects/:id', getProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Payment routes
router.post('/payments', addPayment);
router.get('/payments', getPayments);
router.get('/payments/:id', getPayment);
router.put('/payments/:id', updatePayment);
router.delete('/payments/:id', deletePayment);

// Analytics routes
router.get('/analytics/total', getTotalEarnings);
router.get('/analytics/monthly', getMonthlyEarnings);
router.get('/analytics/client-wise', getClientWiseEarnings);
router.get('/analytics/project-status', getProjectStatusSummary);

// Dashboard route
router.get('/dashboard', getDashboardData);

// Test route
router.get('/test', testMessage);

module.exports = router;
