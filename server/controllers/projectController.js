const db = require('../db');

exports.createProject = async (req, res) => {
  const { name, description, color, due_date } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required' });

  try {
    const [result] = await db.query(
      'INSERT INTO projects (name, description, owner_id, color, due_date) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, req.user.id, color || '#6366f1', due_date || null]
    );

    await db.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, req.user.id, 'owner']
    );

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, req.user.id, 'Created project', 'project', result.insertId]
    );

    res.status(201).json({ message: 'Project created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const [projects] = await db.query(
      `SELECT p.*, pm.role as my_role,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as completed_tasks,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, pm.role as my_role
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE p.id = ? AND pm.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: 'Project not found or access denied' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  const { name, description, color, status, due_date } = req.body;
  try {
    const [member] = await db.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (member.length === 0)
      return res.status(403).json({ message: 'Access denied' });

    if (!['owner', 'manager'].includes(member[0].role))
      return res.status(403).json({ message: 'Only owners and managers can update projects' });

    await db.query(
      'UPDATE projects SET name = ?, description = ?, color = ?, status = ?, due_date = ? WHERE id = ?',
      [name, description, color, status, due_date, req.params.id]
    );

    await db.query(
      'INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, req.user.id, 'Updated project details', 'project', req.params.id]
    );

    res.json({ message: 'Project updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const [member] = await db.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (member.length === 0 || member[0].role !== 'owner')
      return res.status(403).json({ message: 'Only the owner can delete this project' });

    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProjectStats = async (req, res) => {
  try {
    const [member] = await db.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (member.length === 0)
      return res.status(403).json({ message: 'Access denied' });

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM tasks WHERE project_id = ?',
      [req.params.id]
    );
    const [[{ todo }]] = await db.query(
      'SELECT COUNT(*) as todo FROM tasks WHERE project_id = ? AND status = "todo"',
      [req.params.id]
    );
    const [[{ in_progress }]] = await db.query(
      'SELECT COUNT(*) as in_progress FROM tasks WHERE project_id = ? AND status = "in_progress"',
      [req.params.id]
    );
    const [[{ review }]] = await db.query(
      'SELECT COUNT(*) as review FROM tasks WHERE project_id = ? AND status = "review"',
      [req.params.id]
    );
    const [[{ done }]] = await db.query(
      'SELECT COUNT(*) as done FROM tasks WHERE project_id = ? AND status = "done"',
      [req.params.id]
    );
    const [[{ overdue }]] = await db.query(
      'SELECT COUNT(*) as overdue FROM tasks WHERE project_id = ? AND due_date < CURDATE() AND status != "done"',
      [req.params.id]
    );
    const [[{ members }]] = await db.query(
      'SELECT COUNT(*) as members FROM project_members WHERE project_id = ?',
      [req.params.id]
    );

    res.json({ total, todo, in_progress, review, done, overdue, members });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const [member] = await db.query(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (member.length === 0)
      return res.status(403).json({ message: 'Access denied' });

    const [logs] = await db.query(
      `SELECT al.*, u.name as user_name, u.avatar_color
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.project_id = ?
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [req.params.id]
    );

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};