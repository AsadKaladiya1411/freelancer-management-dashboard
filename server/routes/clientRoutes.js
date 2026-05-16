const express = require('express');
const router = express.Router();
const { createClient, getClients, getClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const { clientValidator } = require('../validators/clientValidator');
const validate = require('../middleware/validate');

router.use(protect); // All client routes are protected

router.route('/')
  .post(clientValidator, validate, createClient)
  .get(getClients);

router.route('/:id')
  .get(getClient)
  .put(clientValidator, validate, updateClient)
  .delete(deleteClient);

module.exports = router;
