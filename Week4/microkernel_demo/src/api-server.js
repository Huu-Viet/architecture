import express from 'express';
import cors from 'cors';
import { MicrokernelCore } from './core/kernel.js';

/**
 * HTTP API Server for Microkernel Plugin System
 * Cung cấp REST API để test plugins qua Postman
 */

const app = express();
const port = 3000;
const kernel = new MicrokernelCore();

// Middleware
app.use(express.json());
app.use(cors());

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

// Initialize kernel
console.log('🚀 Initializing Microkernel API Server...');

try {
  await kernel.initialize();
  console.log('✅ Kernel initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize kernel:', error);
  process.exit(1);
}

// ======================
// PLUGIN API ENDPOINTS
// ======================

// SEO Plugin APIs
app.post('/api/seo/optimize', async (req, res) => {
  try {
    console.log('📝 SEO optimization request:', req.body);
    const result = await kernel.processRequest('page:render', req.body);
    res.json({
      success: true,
      message: 'SEO optimization completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'SEO'
    });
  }
});

app.post('/api/seo/analyze', async (req, res) => {
  try {
    console.log('🔍 SEO analysis request:', req.body);
    const result = await kernel.processRequest('content:analyze', req.body);
    res.json({
      success: true,
      message: 'SEO analysis completed',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'SEO'
    });
  }
});

// Comment Plugin APIs
app.post('/api/comments/add', async (req, res) => {
  try {
    console.log('💬 Add comment request:', req.body);
    const result = await kernel.processRequest('comment:add', req.body);
    res.json({
      success: true,
      message: 'Comment processed',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Comment'
    });
  }
});

app.get('/api/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { status = 'approved' } = req.query;
    
    console.log(`💬 Get comments for post: ${postId}, status: ${status}`);
    
    const result = await kernel.processRequest('comment:get', {
      postId: postId,
      status: status,
      includeReplies: true
    });
    
    res.json({
      success: true,
      message: 'Comments retrieved',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Comment'
    });
  }
});

app.post('/api/comments/moderate', async (req, res) => {
  try {
    console.log('🔨 Moderate comment request:', req.body);
    const result = await kernel.processRequest('comment:moderate', req.body);
    res.json({
      success: true,
      message: 'Comment moderated',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Comment'
    });
  }
});

app.get('/api/comments/stats', async (req, res) => {
  try {
    console.log('📊 Comment stats request');
    const result = await kernel.processRequest('comment:stats', {});
    res.json({
      success: true,
      message: 'Comment statistics',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Comment'
    });
  }
});

// Analytics Plugin APIs
app.post('/api/analytics/pageview', async (req, res) => {
  try {
    console.log('📈 Track pageview request:', req.body);
    const result = await kernel.processRequest('page:view', req.body);
    res.json({
      success: true,
      message: 'Pageview tracked',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Analytics'
    });
  }
});

app.post('/api/analytics/session/start', async (req, res) => {
  try {
    console.log('🔗 Start session request:', req.body);
    const result = await kernel.processRequest('session:start', req.body);
    res.json({
      success: true,
      message: 'Session started',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Analytics'
    });
  }
});

app.post('/api/analytics/event', async (req, res) => {
  try {
    console.log('⚡ Track event request:', req.body);
    const result = await kernel.processRequest('user:action', req.body);
    res.json({
      success: true,
      message: 'Event tracked',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Analytics'
    });
  }
});

app.get('/api/analytics/report/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    console.log(`📊 Generate ${type} report`);
    
    const result = await kernel.processRequest('analytics:report', {
      type: type,
      startDate: startDate,
      endDate: endDate
    });
    
    res.json({
      success: true,
      message: `${type} report generated`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Analytics'
    });
  }
});

app.get('/api/analytics/stats', async (req, res) => {
  try {
    console.log('📊 Analytics stats request');
    const result = await kernel.processRequest('analytics:stats', {});
    res.json({
      success: true,
      message: 'Analytics statistics',
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      plugin: 'Analytics'
    });
  }
});

// ============================
// PLUGIN MANAGEMENT ENDPOINTS
// ============================

// Get all plugins info
app.get('/api/plugins', (req, res) => {
  try {
    const plugins = kernel.getPlugins().map(plugin => plugin.getInfo());
    res.json({
      success: true,
      message: 'Plugins retrieved',
      data: {
        total: plugins.length,
        plugins: plugins
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Toggle plugin (enable/disable)
app.post('/api/plugins/:name/toggle', (req, res) => {
  try {
    const { name } = req.params;
    const { enabled } = req.body;
    
    console.log(`🔧 Toggle plugin '${name}': ${enabled ? 'enable' : 'disable'}`);
    
    const plugin = kernel.pluginManager.getPlugin(name);
    if (!plugin) {
      return res.status(404).json({
        success: false,
        error: `Plugin '${name}' not found`
      });
    }
    
    kernel.togglePlugin(name, enabled);
    
    res.json({
      success: true,
      message: `Plugin '${name}' ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        plugin: name,
        enabled: enabled,
        status: plugin.isEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get specific plugin info
app.get('/api/plugins/:name', (req, res) => {
  try {
    const { name } = req.params;
    const plugin = kernel.pluginManager.getPlugin(name);
    
    if (!plugin) {
      return res.status(404).json({
        success: false,
        error: `Plugin '${name}' not found`
      });
    }
    
    let pluginStats = plugin.getInfo();
    
    // Get additional stats if plugin supports it
    if (typeof plugin.getStats === 'function') {
      pluginStats = plugin.getStats();
    }
    
    res.json({
      success: true,
      message: `Plugin '${name}' information`,
      data: pluginStats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ======================
// SYSTEM ENDPOINTS
// ======================

// System health check
app.get('/api/health', (req, res) => {
  const systemInfo = kernel.getSystemInfo();
  res.json({
    success: true,
    message: 'System healthy',
    data: systemInfo
  });
});

// Process generic request
app.post('/api/process', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Request type is required'
      });
    }
    
    console.log(`🔄 Process generic request: ${type}`);
    
    const result = await kernel.processRequest(type, data || {});
    
    res.json({
      success: true,
      message: `Request '${type}' processed`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Microkernel Plugin System API',
    version: '1.0.0',
    endpoints: {
      'SEO Plugin': {
        'POST /api/seo/optimize': 'Optimize page for SEO',
        'POST /api/seo/analyze': 'Analyze content SEO'
      },
      'Comment Plugin': {
        'POST /api/comments/add': 'Add new comment',
        'GET /api/comments/:postId': 'Get comments for post',
        'POST /api/comments/moderate': 'Moderate comment',
        'GET /api/comments/stats': 'Get comment statistics'
      },
      'Analytics Plugin': {
        'POST /api/analytics/pageview': 'Track page view',
        'POST /api/analytics/session/start': 'Start user session',
        'POST /api/analytics/event': 'Track user event',
        'GET /api/analytics/report/:type': 'Generate analytics report',
        'GET /api/analytics/stats': 'Get analytics statistics'
      },
      'Plugin Management': {
        'GET /api/plugins': 'List all plugins',
        'POST /api/plugins/:name/toggle': 'Enable/disable plugin',
        'GET /api/plugins/:name': 'Get plugin info'
      },
      'System': {
        'GET /api/health': 'System health check',
        'POST /api/process': 'Process generic request',
        'GET /api': 'This documentation'
      }
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`\\n🌐 Microkernel API Server running on:`);
  console.log(`   → http://localhost:${port}`);
  console.log(`   → API Documentation: http://localhost:${port}/api`);
  console.log(`\\n🚀 Ready for Postman testing!\\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\n🛑 Shutting down API server...');
  await kernel.shutdown();
  process.exit(0);
});