const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getComments,
  addComment,
  deleteComment,
} = require('../controllers/taskController');

router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.patch('/:id/status', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;