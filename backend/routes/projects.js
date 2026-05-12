// Projects API - Portfolio Management
const router = require('express').Router();
const auth = require('../middleware/auth');
const supabase = require('../supabase');

// Get all projects for portfolio
const FALLBACK_PROJECTS = [
  { title: 'Cyberian', description: 'API Quality Scanner — 6 dimensions, 35+ checks, CI/CD ready', tech: 'Next.js,TypeScript,Supabase,Stripe,Tailwind', github_url: 'https://github.com/EliasOulkadi', live_url: 'https://cyberian.online', featured: true },
  { title: 'AnimeClips Online', description: 'Anime community site with custom video player and search', tech: 'HTML,CSS,JavaScript', github_url: 'https://github.com/EliasOulkadi/animeclips-online', live_url: 'https://animeonline-lime.vercel.app/index.html', featured: true },
  { title: 'Portfolio CMS', description: 'Full-stack portfolio with Node.js API, JWT auth, Supabase', tech: 'Node.js,Express,Supabase,JWT', github_url: 'https://github.com/EliasOulkadi/portfolio', live_url: '', featured: true },
  { title: 'PromptBook', description: 'Local AI prompt manager — save, search, copy', tech: 'CSS,JavaScript,Electron', github_url: 'https://github.com/EliasOulkadi/promptbook', live_url: '', featured: false },
  { title: 'Whendone', description: 'Desktop notification when CLI commands finish', tech: 'JavaScript', github_url: 'https://github.com/EliasOulkadi/whendone', live_url: '', featured: false },
  { title: 'Image Quality Enhancer', description: 'AI image upscaling and enhancement prompts', tech: 'AI,Python', github_url: 'https://github.com/EliasOulkadi/image-quality-enhancer-prompt', live_url: '', featured: false }
];

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error || !data || data.length === 0) {
      return res.json(FALLBACK_PROJECTS);
    }
    res.json(data);
  } catch (err) {
    res.json(FALLBACK_PROJECTS);
  }
});

// Create new project (admin only)
router.post('/', auth, async (req, res) => {
  const { title, description, tech, github_url, live_url, featured, order_idx } = req.body;
  
  // Input validation
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
    console.error('Project creation failed:', err);
    res.status(500).json({ error: 'Failed to create project' });
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
    console.error('Project update failed:', err);
    res.status(500).json({ error: 'Failed to update project' });
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
    console.error('Project deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Seed database with sample projects (development)
router.post('/seed', async (req, res) => {
  try {
    // Check if projects already exist
    const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    if (count > 0) {
      return res.json({ message: 'Projects already exist - skipping seed' });
    }

    // Sample projects data
    const sampleProjects = [
      {
        title: 'AnimeClips Online',
        description: 'Full anime community website with custom video player, search, blog, and membership features. Built from scratch with vanilla JavaScript.',
        tech: 'HTML,CSS,JavaScript',
        github_url: 'https://github.com/EliasOulkadi/animeclips-online',
        live_url: 'https://animeonline-lime.vercel.app/index.html',
        featured: true,
        order_idx: 1
      },
      {
        title: 'Portfolio CMS',
        description: 'This portfolio! Full-stack application with Node.js API, JWT authentication, Supabase database, and admin panel. Built to showcase skills and manage projects.',
        tech: 'Node.js,Express,Supabase,JWT,SQL,HTML,CSS,JavaScript',
        github_url: 'https://github.com/EliasOulkadi',
        live_url: '',
        featured: true,
        order_idx: 2
      },
      {
        title: 'REST API with JWT Auth',
        description: 'Clean REST API built for learning authentication. Full CRUD operations, JWT tokens, input validation, and error handling. Connected to Supabase PostgreSQL.',
        tech: 'Node.js,Express,JWT,SQL,Supabase',
        github_url: 'https://github.com/EliasOulkadi',
        live_url: '',
        featured: false,
        order_idx: 3
      }
    ];

    const { error } = await supabase.from('projects').insert(sampleProjects);
    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Sample projects created successfully!', 
      count: sampleProjects.length,
      projects: sampleProjects.map(p => p.title)
    });
  } catch (err) {
    console.error('Database seeding failed:', err);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

module.exports = router;
