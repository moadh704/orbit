const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  getActivityLogs,
} = require('../controllers/projectController');

router.get('/', protect, getMyProjects);
router.post('/', protect, createProject);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.get('/:id/stats', protect, getProjectStats);
router.get('/:id/logs', protect, getActivityLogs);

module.exports = router;