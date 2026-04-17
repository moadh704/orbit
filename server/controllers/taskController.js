const db = require('../db');

const checkProjectAccess = async (projectId, userId) => {
  const [member] = await db.query(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
  return member.length > 0 ? member[0] : null;
};

exports.getTasks = async (req, res) => {
  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const [tasks] = await db.query(
      `SELECT t.*, 
        u.name as assignee_name, 
        u.avatar_color as assignee_color,
        c.name as creator_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.project_id = ?
       ORDER BY t.position ASC, t.created_at ASC`,
      [req.params.projectId]
    );

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, status, priority, assignee_id, due_date } = req.body;
  if (!title) return res.status(400).json({ message: 'Task title is required' });

  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const [[{ maxPos }]] = await db.query(
      'SELECT MAX(position) as maxPos FROM tasks WHERE project_id = ? AND status = ?',
      [req.params.projectId, status || 'todo']
    );

    const [result] = await db.query(
      `INSERT INTO tasks 
        (project_id, title, description, status, priority, assignee_id, due_date, position, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.projectId,
        title,
        description || null,
        status || 'todo',
        priority || 'medium',
        assignee_id || null,
        due_date || null,
        (maxPos || 0) + 1,
        req.user.id,
      ]
    );

    const io = req.app.get('io');
    io.to(`project-${req.params.projectId}`).emit('task-created', { taskId: result.insertId });

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [req.params.projectId, req.user.id, `Created task "${title}"`, 'task', result.insertId]
    );

    res.status(201).json({ message: 'Task created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  const { title, description, status, priority, assignee_id, due_date } = req.body;

  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const [task] = await db.query(
      'SELECT * FROM tasks WHERE id = ? AND project_id = ?',
      [req.params.id, req.params.projectId]
    );

    if (task.length === 0)
      return res.status(404).json({ message: 'Task not found' });

    await db.query(
      `UPDATE tasks SET 
        title = ?, description = ?, status = ?, 
        priority = ?, assignee_id = ?, due_date = ?
       WHERE id = ?`,
      [title, description, status, priority, assignee_id || null, due_date || null, req.params.id]
    );

    const io = req.app.get('io');
    io.to(`project-${req.params.projectId}`).emit('task-updated', { taskId: req.params.id });

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [req.params.projectId, req.user.id, `Updated task "${title}"`, 'task', req.params.id]
    );

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { status, position } = req.body;

  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    await db.query(
      'UPDATE tasks SET status = ?, position = ? WHERE id = ? AND project_id = ?',
      [status, position, req.params.id, req.params.projectId]
    );

    const io = req.app.get('io');
    io.to(`project-${req.params.projectId}`).emit('task-moved', {
      taskId: req.params.id,
      status,
      position,
    });

    res.json({ message: 'Task status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const [task] = await db.query(
      'SELECT title FROM tasks WHERE id = ? AND project_id = ?',
      [req.params.id, req.params.projectId]
    );

    if (task.length === 0)
      return res.status(404).json({ message: 'Task not found' });

    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    const io = req.app.get('io');
    io.to(`project-${req.params.projectId}`).emit('task-deleted', { taskId: req.params.id });

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [req.params.projectId, req.user.id, `Deleted task "${task[0].title}"`, 'task', req.params.id]
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const [comments] = await db.query(
      `SELECT c.*, u.name as user_name, u.avatar_color
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addComment = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Comment content is required' });

  try {
    const member = await checkProjectAccess(req.params.projectId, req.user.id);
    if (!member) return res.status(403).json({ message: 'Access denied' });

    const [result] = await db.query(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );

    const io = req.app.get('io');
    io.to(`project-${req.params.projectId}`).emit('comment-added', {
      taskId: req.params.id,
      commentId: result.insertId,
    });

    res.status(201).json({ message: 'Comment added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const [comment] = await db.query(
      'SELECT * FROM comments WHERE id = ?',
      [req.params.commentId]
    );

    if (comment.length === 0)
      return res.status(404).json({ message: 'Comment not found' });

    if (comment[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'You can only delete your own comments' });

    await db.query('DELETE FROM comments WHERE id = ?', [req.params.commentId]);

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};