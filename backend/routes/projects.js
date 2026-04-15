// Projects API - Manage portfolio projects
const router = require('express').Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

// Get all projects for portfolio display
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_idx', { ascending: true })  // Custom order first
      .order('created_at', { ascending: false }); // Newest first
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Something went wrong fetching projects' });
  }
});

// Create new project (admin only)
router.post('/', auth, async (req, res) => {
  const { title, description, tech, github_url, live_url, featured, order_idx } = req.body;
  
  // Basic validation - title is mandatory
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Project title is required' });
  }
  
  try {
    const projectData = {
      title: title.trim(),
      description: description?.trim() || '',
      tech: tech || '',
      github_url: github_url?.trim() || '',
      live_url: live_url?.trim() || '',
      featured: !!featured,
      order_idx: order_idx || 0
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
      
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Could not create project' });
  }
});

// Update existing project (admin only)
router.put('/:id', auth, async (req, res) => {
  const { title, description, tech, github_url, live_url, featured, order_idx } = req.body;
  
  try {
    const updateData = {
      title: title?.trim() || undefined,
      description: description?.trim() || '',
      tech: tech || '',
      github_url: github_url?.trim() || '',
      live_url: live_url?.trim() || '',
      featured: !!featured,
      order_idx: order_idx || 0
    };
    
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Could not update project' });
  }
});

// Delete project (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Could not delete project' });
  }
});

// Seed database with sample projects (dev helper)
router.post('/seed', async (req, res) => {
  try {
    // Check if we already have projects
    const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    if (count > 0) {
      return res.json({ message: 'Database already has projects - skipping seed' });
    }

    // My actual projects - these are real!
    const myProjects = [
      {
        title: 'AnimeClips Online',
        description: 'My first big project - a full anime community website with custom video player, search, blog, and membership features. Built completely from scratch with vanilla JS.',
        tech: 'HTML,CSS,JavaScript',
        github_url: 'https://github.com/EliasOulkadi/animeclips-online',
        live_url: 'https://animeonline-lime.vercel.app/index.html',
        featured: true,
        order_idx: 1
      },
      {
        title: 'Portfolio CMS',
        description: 'This very portfolio! Full-stack app with Node.js API, JWT auth, Supabase DB, and admin panel. I built it to showcase my skills and manage my projects.',
        tech: 'Node.js,Express,Supabase,JWT,SQL,HTML,CSS,JavaScript',
        github_url: 'https://github.com/EliasOulkadi',
        live_url: '',
        featured: true,
        order_idx: 2
      },
      {
        title: 'REST API with JWT Auth',
        description: 'Clean REST API I built to learn authentication. Full CRUD, JWT tokens, validation, and proper error handling. Connected to Supabase PostgreSQL.',
        tech: 'Node.js,Express,JWT,SQL,Supabase',
        github_url: 'https://github.com/EliasOulkadi',
        live_url: '',
        featured: false,
        order_idx: 3
      }
    ];

    const { error } = await supabase.from('projects').insert(myProjects);
    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Sample projects added successfully!', 
      count: myProjects.length,
      projects: myProjects.map(p => p.title)
    });
  } catch (err) {
    console.error('Seeding error:', err);
    res.status(500).json({ error: 'Failed to seed projects' });
  }
});

module.exports = router;
