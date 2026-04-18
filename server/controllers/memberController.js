const db = require('../db');
const crypto = require('crypto');
const { sendInviteEmail } = require('../utils/sendEmail');

const checkProjectAccess = async (projectId, userId) => {
  const [member] = await db.query(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
  return member.length > 0 ? member[0] : null;
};

exports.getMembers = async (req, res) => {
  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const [members] = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_color, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.joined_at ASC`,
      [req.params.projectId]
    );

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.inviteMember = async (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });
    if (!['owner', 'manager'].includes(member.role))
      return res.status(403).json({ message: 'Only owners and managers can invite members' });

    const [project] = await db.query('SELECT name FROM projects WHERE id = ?', [req.params.projectId]);
    if (project.length === 0)
      return res.status(404).json({ message: 'Project not found' });

    const [inviter] = await db.query('SELECT name FROM users WHERE id = ?', [req.user.id]);

    // Check if already a member
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      const [alreadyMember] = await db.query(
        'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
        [req.params.projectId, existingUser[0].id]
      );
      if (alreadyMember.length > 0)
        return res.status(400).json({ message: 'User is already a member' });
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(
      'INSERT INTO invitations (project_id, email, token, role, expires_at, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.projectId, email, token, role || 'member', expiresAt, req.user.id]
    );

    await sendInviteEmail(email, inviter[0].name, project[0].name, token);

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [req.params.projectId, req.user.id, `Invited ${email} to project`, 'invitation', req.params.projectId]
    );

    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.acceptInvite = async (req, res) => {
  const { token } = req.params;

  try {
    const [invitations] = await db.query(
      'SELECT * FROM invitations WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (invitations.length === 0)
      return res.status(400).json({ message: 'Invalid or expired invitation' });

    const invite = invitations[0];

    // Check if already a member
    const [alreadyMember] = await db.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [invite.project_id, req.user.id]
    );

    if (alreadyMember.length > 0)
      return res.status(400).json({ message: 'You are already a member of this project' });

    await db.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [invite.project_id, req.user.id, invite.role]
    );

    await db.query('DELETE FROM invitations WHERE token = ?', [token]);

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [invite.project_id, req.user.id, 'Joined the project', 'member', req.user.id]
    );

    res.json({ message: 'Successfully joined the project', projectId: invite.project_id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  const { role } = req.body;
  const validRoles = ['manager', 'member'];
  if (!validRoles.includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member || member.role !== 'owner')
      return res.status(403).json({ message: 'Only owners can change member roles' });

    if (parseInt(req.params.userId) === req.user.id)
      return res.status(403).json({ message: 'You cannot change your own role' });

    await db.query(
      'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
      [role, req.params.projectId, req.params.userId]
    );

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [req.params.projectId, req.user.id, `Changed member role to ${role}`, 'member', req.params.userId]
    );

    res.json({ message: 'Member role updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member || !['owner', 'manager'].includes(member.role))
      return res.status(403).json({ message: 'Only owners and managers can remove members' });

    if (parseInt(req.params.userId) === req.user.id)
      return res.status(403).json({ message: 'You cannot remove yourself' });

    const [targetMember] = await db.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.projectId, req.params.userId]
    );

    if (targetMember.length === 0)
      return res.status(404).json({ message: 'Member not found' });

    if (targetMember[0].role === 'owner')
      return res.status(403).json({ message: 'Cannot remove the project owner' });

    await db.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.projectId, req.params.userId]
    );

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [req.params.projectId, req.user.id, 'Removed a member from project', 'member', req.params.userId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.leaveProject = async (req, res) => {
  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    if (member.role === 'owner')
      return res.status(403).json({ message: 'Owners cannot leave their own project — transfer ownership or delete the project' });

    await db.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.projectId, req.user.id]
    );

    res.json({ message: 'You have left the project' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};