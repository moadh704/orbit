const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  getMembers,
  inviteMember,
  acceptInvite,
  updateMemberRole,
  removeMember,
  leaveProject,
} = require('../controllers/memberController');

router.get('/', protect, getMembers);
router.post('/invite', protect, inviteMember);
router.post('/accept/:token', protect, acceptInvite);
router.put('/:userId/role', protect, updateMemberRole);
router.delete('/:userId', protect, removeMember);
router.delete('/leave', protect, leaveProject);

module.exports = router;