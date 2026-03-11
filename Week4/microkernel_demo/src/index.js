import { MicrokernelCore } from './core/kernel.js';

/**
 * Microkernel Plugin System Demo
 * ===============================
 * 
 * Đây là một demo về Microkernel Architecture với hệ thống plugin.
 * Hệ thống bao gồm:
 * 
 * - Core Kernel: Trái tim của hệ thống
 * - Plugin Manager: Quản lý load/unload plugins
 * - Plugin Base: Class cha cho tất cả plugins
 * - 3 Plugin mẫu:
 *   + SEO Plugin: Tối ưu hóa SEO
 *   + Comment Plugin: Quản lý bình luận
 *   + Analytics Plugin: Theo dõi và phân tích
 */

class MicrokernelDemo {
  constructor() {
    this.kernel = new MicrokernelCore();
  }

  async start() {
    console.log('🚀 Starting Microkernel Demo...\n');
    
    try {
      // Initialize kernel
      await this.kernel.initialize();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Run demo scenarios
      await this.runDemoScenarios();
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.kernel.on('kernel:initialized', (data) => {
      console.log('🎉 Kernel initialized at:', data.timestamp);
    });

    this.kernel.on('request:start', (data) => {
      console.log(`🔄 Processing request ${data.requestId}: ${data.type}`);
    });

    this.kernel.on('request:complete', (data) => {
      console.log(`✅ Request ${data.requestId} completed successfully`);
    });

    this.kernel.on('request:error', (data) => {
      console.log(`❌ Request ${data.requestId} failed: ${data.error}`);
    });
  }

  /**
   * Run demonstration scenarios
   */
  async runDemoScenarios() {
    console.log('\n📋 Running Demo Scenarios...\n');

    // Show system info
    await this.showSystemInfo();

    // Demo 1: Page rendering with SEO optimization
    await this.demoSEOOptimization();

    // Demo 2: Comment system
    await this.demoCommentSystem();

    // Demo 3: Analytics tracking
    await this.demoAnalyticsSystem();

    // Demo 4: Content analysis workflow
    await this.demoContentAnalysis();

    // Demo 5: Plugin management
    await this.demoPluginManagement();

    console.log('\n🎉 Demo completed successfully!');
  }

  /**
   * Show system information
   */
  async showSystemInfo() {
    console.log('='.repeat(50));
    console.log('📊 SYSTEM INFORMATION');
    console.log('='.repeat(50));
    
    const systemInfo = this.kernel.getSystemInfo();
    console.log(`Kernel Status: ${systemInfo.initialized ? '✅ Running' : '❌ Stopped'}`);
    console.log(`Uptime: ${Math.round(systemInfo.uptime)}s`);
    console.log(`Loaded Plugins: ${systemInfo.plugins.length}`);
    
    systemInfo.plugins.forEach(plugin => {
      console.log(`  - ${plugin.name} v${plugin.version} (${plugin.enabled ? 'enabled' : 'disabled'})`);
    });
    
    console.log(`Services: ${systemInfo.services.length}`);
    console.log('');
  }

  /**
   * Demo SEO Plugin
   */
  async demoSEOOptimization() {
    console.log('='.repeat(50));
    console.log('🔍 SEO OPTIMIZATION DEMO');
    console.log('='.repeat(50));

    // Test page optimization
    const pageData = {
      url: '/blog/microkernel-architecture',
      title: 'Understanding Microkernel Architecture in Modern Software Development',
      description: 'Learn how microkernel architecture provides flexibility and modularity',
      content: '<h1>Microkernel Architecture</h1><p>This is a comprehensive guide...</p>',
      keywords: ['microkernel', 'architecture', 'software', 'modular']
    };

    const result = await this.kernel.processRequest('page:render', pageData);
    console.log('Page optimized with SEO data:');
    console.log(JSON.stringify(result.results[0]?.result?.seo, null, 2));

    // Test content analysis
    const analysisResult = await this.kernel.processRequest('content:analyze', {
      title: 'Short title',
      content: 'Too short content without proper structure.'
    });

    console.log('\nSEO Analysis Result:');
    const analysis = analysisResult.results[0]?.result;
    console.log(`SEO Score: ${analysis.seoScore}/100 (${analysis.grade})`);
    console.log('Issues:', analysis.issues);
    console.log('Recommendations:', analysis.recommendations);
    console.log('');
  }

  /**
   * Demo Comment Plugin
   */
  async demoCommentSystem() {
    console.log('='.repeat(50));
    console.log('💬 COMMENT SYSTEM DEMO');
    console.log('='.repeat(50));

    // Add a comment
    const commentResult = await this.kernel.processRequest('comment:add', {
      postId: 'post-123',
      author: 'John Doe',
      email: 'john@example.com',
      content: 'This is a great article about microkernel architecture!',
      ip: '192.168.1.100'
    });

    console.log('Comment added:');
    console.log(`Status: ${commentResult.results[0]?.result?.status}`);
    console.log(`Requires Moderation: ${commentResult.results[0]?.result?.requiresModeration}`);

    // Add another comment with spam content
    await this.kernel.processRequest('comment:add', {
      postId: 'post-123',
      author: 'Spammer',
      email: 'spam@badsite.com',
      content: 'Check out my spam website http://spam.com for inappropriate content!',
      ip: '10.0.0.1'
    });

    // Get comments for the post
    const commentsResult = await this.kernel.processRequest('comment:get', {
      postId: 'post-123',
      status: 'all'
    });

    console.log(`\nTotal comments for post: ${commentsResult.results[0]?.result?.totalCount}`);

    // Get comment statistics
    const statsResult = await this.kernel.processRequest('comment:stats', {});
    console.log('\nComment Statistics:');
    console.log(JSON.stringify(statsResult.results[0]?.result?.statistics, null, 2));
    console.log('');
  }

  /**
   * Demo Analytics Plugin
   */
  async demoAnalyticsSystem() {
    console.log('='.repeat(50));
    console.log('📊 ANALYTICS SYSTEM DEMO');
    console.log('='.repeat(50));

    // Start a session
    const sessionResult = await this.kernel.processRequest('session:start', {
      userId: 'user-456',
      ip: '203.0.113.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
      referrer: 'https://google.com'
    });

    const sessionId = sessionResult.results[0]?.result?.session?.id;
    console.log(`Session started: ${sessionId}`);

    // Track page views
    await this.kernel.processRequest('page:view', {
      url: '/home',
      title: 'Homepage',
      sessionId: sessionId,
      referrer: 'https://google.com',
      loadTime: 250,
      ip: '203.0.113.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0'
    });

    await this.kernel.processRequest('page:view', {
      url: '/blog/microkernel-architecture',
      title: 'Microkernel Architecture',
      sessionId: sessionId,
      loadTime: 180,
      ip: '203.0.113.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0'
    });

    // Track user actions
    await this.kernel.processRequest('user:action', {
      type: 'click',
      element: 'newsletter-signup',
      sessionId: sessionId,
      url: '/home'
    });

    // Track performance
    await this.kernel.processRequest('performance:track', {
      url: '/blog/microkernel-architecture',
      loadTime: 180,
      domContentLoaded: 150,
      timeToFirstByte: 50,
      sessionId: sessionId
    });

    // Generate analytics report
    const reportResult = await this.kernel.processRequest('analytics:report', {
      type: 'daily'
    });

    console.log('\nDaily Analytics Report:');
    console.log(JSON.stringify(reportResult.results[0]?.result?.metrics, null, 2));

    // Get analytics stats
    const analyticsStats = await this.kernel.processRequest('analytics:stats', {});
    console.log('\nAnalytics Statistics:');
    console.log(JSON.stringify(analyticsStats.results[0]?.result?.statistics, null, 2));
    console.log('');
  }

  /**
   * Demo content analysis workflow
   */
  async demoContentAnalysis() {
    console.log('='.repeat(50));
    console.log('🔄 CONTENT ANALYSIS WORKFLOW DEMO');
    console.log('='.repeat(50));

    const contentData = {
      url: '/blog/new-post',
      title: 'Building Scalable Microservices with Microkernel Architecture Pattern',
      description: 'A comprehensive guide to implementing microkernel architecture for building scalable and maintainable microservices applications.',
      content: `
        <h1>Building Scalable Microservices</h1>
        <p>Microkernel architecture is a software design pattern that provides a minimal core system with extended functionality through plugins.</p>
        <h2>Key Benefits</h2>
        <p>The main advantages include modularity, flexibility, and easier maintenance.</p>
        <img src="/images/architecture.png" alt="Microkernel Architecture Diagram" />
        <p>This approach allows for dynamic loading and unloading of components at runtime.</p>
      `,
      keywords: ['microkernel', 'microservices', 'architecture', 'scalable', 'plugins'],
      author: 'Tech Writer',
      publishDate: new Date().toISOString()
    };

    // Process through all plugins simultaneously
    const result = await this.kernel.processRequest('page:render', contentData);
    
    console.log('Content processed through all plugins:');
    result.results.forEach((pluginResult, index) => {
      console.log(`\n${index + 1}. ${pluginResult.plugin} Plugin:`);
      if (pluginResult.success) {
        console.log('   ✅ Processing successful');
        if (pluginResult.plugin === 'seo' && pluginResult.result?.seo) {
          console.log(`   📊 SEO Score: Generated meta tags and structured data`);
        }
        if (pluginResult.plugin === 'comment') {
          console.log(`   💬 Comment system ready for this content`);
        }
        if (pluginResult.plugin === 'analytics') {
          console.log(`   📈 Analytics tracking enabled`);
        }
      } else {
        console.log(`   ❌ Error: ${pluginResult.error}`);
      }
    });
    console.log('');
  }

  /**
   * Demo plugin management
   */
  async demoPluginManagement() {
    console.log('='.repeat(50));
    console.log('🔧 PLUGIN MANAGEMENT DEMO');
    console.log('='.repeat(50));

    // Show current plugin status
    const plugins = this.kernel.getPlugins();
    console.log('Current plugins:');
    plugins.forEach(plugin => {
      console.log(`- ${plugin.name}: ${plugin.isEnabled ? 'enabled' : 'disabled'}`);
    });

    // Disable SEO plugin
    console.log('\\n🔄 Disabling SEO plugin...');
    this.kernel.togglePlugin('seo', false);

    // Test request without SEO plugin
    const resultWithoutSEO = await this.kernel.processRequest('page:render', {
      title: 'Test page',
      content: 'Test content'
    });

    console.log('\\nRequest processed without SEO plugin:');
    resultWithoutSEO.results.forEach(result => {
      console.log(`- ${result.plugin}: ${result.success ? 'processed' : 'failed'}`);
    });

    // Re-enable SEO plugin
    console.log('\\n🔄 Re-enabling SEO plugin...');
    this.kernel.togglePlugin('seo', true);

    console.log('✅ Plugin management demo completed');
    console.log('');
  }

  /**
   * Shutdown demo
   */
  async shutdown() {
    console.log('🔄 Shutting down demo...');
    await this.kernel.shutdown();
    console.log('✅ Demo shutdown complete');
  }
}

// Run the demo
const demo = new MicrokernelDemo();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\n🛑 Received shutdown signal...');
  await demo.shutdown();
  process.exit(0);
});

// Start demo
demo.start().catch(error => {
  console.error('❌ Demo crashed:', error);
  process.exit(1);
});