const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { projectValidator } = require('../validators/projectValidator');
const validate = require('../middleware/validate');

router.use(protect);

router.route('/')
  .post(projectValidator, validate, createProject)
  .get(getProjects);

router.route('/:id')
  .get(getProject)
  .put(projectValidator, validate, updateProject)
  .delete(deleteProject);

module.exports = router;
