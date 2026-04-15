const router = require('express').Router();
const authGuard = require('../middleware/auth');
const supabase = require('../supabase');

router.use(authGuard);

router.get('/', async (req, res) => {
  const { status, priority, search } = req.query;

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);
  if (priority && priority !== 'all') query = query.eq('priority', priority);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Could not fetch tasks' });
  res.json(data);
});

router.get('/stats', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('status, priority, due_date')
    .eq('user_id', req.userId);

  if (error) return res.status(500).json({ error: 'Could not fetch stats' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    total:      data.length,
    pending:    data.filter(t => t.status === 'pending').length,
    inProgress: data.filter(t => t.status === 'in-progress').length,
    completed:  data.filter(t => t.status === 'completed').length,
    urgent:     data.filter(t => t.priority === 'urgent').length,
    overdue:    data.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < today;
    }).length
  };

  res.json(stats);
});

router.post('/', async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: req.userId,
      title: title.trim(),
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      due_date: due_date || null
    })
    .select()
    .single();

  if (error) {
    console.error('Create task error:', error.message);
    return res.status(500).json({ error: 'Could not create task' });
  }

  res.status(201).json(data);
});

router.put('/:id', async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (due_date !== undefined) updates.due_date = due_date || null;

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.userId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Could not update task' });
  if (!data) return res.status(404).json({ error: 'Task not found' });

  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.userId);

  if (error) return res.status(500).json({ error: 'Could not delete task' });
  res.json({ ok: true });
});

module.exports = router;
