import { PluginBase } from '../../core/plugin-base.js';

/**
 * Analytics Plugin - Theo dõi và phân tích dữ liệu website
 */
export default class AnalyticsPlugin extends PluginBase {
  constructor(name, config) {
    super(name, config);
    this.sessions = new Map();
    this.pageViews = [];
    this.events = [];
    this.visitors = new Map();
    this.performance = [];
    this.reports = {
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map()
    };
  }

  async initialize() {
    await super.initialize();
    console.log('📊 Analytics Plugin: Ready to track and analyze');
    
    // Setup periodic report generation
    if (this.config.reporting.dailyReports) {
      setInterval(() => {
        this.generateDailyReport();
      }, 24 * 60 * 60 * 1000); // Daily
    }
  }

  /**
   * Thực thi analytics operations
   */
  async execute(data) {
    const { type, data: requestData } = data;
    
    let result = requestData;

    switch (type) {
      case 'page:view':
        result = await this.trackPageView(requestData);
        break;
      
      case 'user:action':
        result = await this.trackUserAction(requestData);
        break;
      
      case 'session:start':
        result = await this.startSession(requestData);
        break;

      case 'session:end':
        result = await this.endSession(requestData);
        break;
      
      case 'performance:track':
        result = await this.trackPerformance(requestData);
        break;

      case 'analytics:report':
        result = await this.generateReport(requestData);
        break;

      case 'analytics:stats':
        result = await this.getAnalyticsStats(requestData);
        break;
      
      default:
        result = await this.processAnalyticsRequest(requestData);
    }

    console.log(`📊 Analytics Plugin processed: ${type}`);
    return result;
  }

  /**
   * Track page view
   */
  async trackPageView(viewData) {
    if (!this.config.settings.trackPageViews) {
      return { tracked: false, reason: 'Page tracking disabled' };
    }

    const pageView = {
      id: this.generateEventId(),
      url: viewData.url,
      title: viewData.title,
      referrer: viewData.referrer,
      userAgent: viewData.userAgent,
      ip: this.config.settings.anonymizeIP ? this.anonymizeIP(viewData.ip) : viewData.ip,
      sessionId: viewData.sessionId,
      userId: viewData.userId,
      timestamp: new Date().toISOString(),
      loadTime: viewData.loadTime,
      device: this.parseDevice(viewData.userAgent)
    };

    // Check Do Not Track
    if (this.config.privacy.respectDNT && viewData.doNotTrack) {
      return { tracked: false, reason: 'Do Not Track enabled' };
    }

    this.pageViews.push(pageView);
    
    // Update visitor data
    this.updateVisitorData(pageView);
    
    // Update session data
    this.updateSessionData(pageView);

    console.log(`📊 Page view tracked: ${pageView.url}`);

    return {
      tracked: true,
      pageView: pageView,
      sessionActive: this.sessions.has(pageView.sessionId)
    };
  }

  /**
   * Track user action/event
   */
  async trackUserAction(actionData) {
    if (!this.config.settings.trackUserActions) {
      return { tracked: false, reason: 'User action tracking disabled' };
    }

    const event = {
      id: this.generateEventId(),
      type: actionData.type, // click, scroll, form_submit, etc.
      element: actionData.element,
      value: actionData.value,
      url: actionData.url,
      sessionId: actionData.sessionId,
      userId: actionData.userId,
      timestamp: new Date().toISOString(),
      properties: actionData.properties || {}
    };

    this.events.push(event);

    console.log(`📊 User action tracked: ${event.type} on ${event.element}`);

    return {
      tracked: true,
      event: event
    };
  }

  /**
   * Start user session
   */
  async startSession(sessionData) {
    const session = {
      id: sessionData.sessionId || this.generateSessionId(),
      userId: sessionData.userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      pageViews: 0,
      events: 0,
      referrer: sessionData.referrer,
      userAgent: sessionData.userAgent,
      ip: this.config.settings.anonymizeIP ? this.anonymizeIP(sessionData.ip) : sessionData.ip,
      device: this.parseDevice(sessionData.userAgent),
      isActive: true
    };

    this.sessions.set(session.id, session);

    console.log(`📊 Session started: ${session.id}`);

    return {
      session: session,
      trackingEnabled: true
    };
  }

  /**
   * End user session
   */
  async endSession(sessionData) {
    const session = this.sessions.get(sessionData.sessionId);
    
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const now = new Date();
    const startTime = new Date(session.startTime);
    const duration = now - startTime;

    session.endTime = now.toISOString();
    session.duration = duration;
    session.isActive = false;

    console.log(`📊 Session ended: ${session.id} (${Math.round(duration / 1000)}s)`);

    return {
      success: true,
      session: session,
      duration: duration
    };
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(perfData) {
    if (!this.config.settings.trackPerformance) {
      return { tracked: false, reason: 'Performance tracking disabled' };
    }

    const performance = {
      id: this.generateEventId(),
      url: perfData.url,
      loadTime: perfData.loadTime,
      domContentLoaded: perfData.domContentLoaded,
      timeToFirstByte: perfData.timeToFirstByte,
      firstContentfulPaint: perfData.firstContentfulPaint,
      largestContentfulPaint: perfData.largestContentfulPaint,
      cumulativeLayoutShift: perfData.cumulativeLayoutShift,
      sessionId: perfData.sessionId,
      timestamp: new Date().toISOString(),
      device: this.parseDevice(perfData.userAgent)
    };

    this.performance.push(performance);

    console.log(`📊 Performance tracked: ${perfData.url} (${perfData.loadTime}ms)`);

    return {
      tracked: true,
      performance: performance
    };
  }

  /**
   * Generate analytics report
   */
  async generateReport(reportData) {
    const { type = 'daily', startDate, endDate } = reportData;
    
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate(type);
    const end = endDate ? new Date(endDate) : new Date();

    const report = {
      type: type,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      generatedAt: new Date().toISOString(),
      metrics: {}
    };

    // Filter data by date range
    const filteredPageViews = this.filterByDateRange(this.pageViews, start, end);
    const filteredEvents = this.filterByDateRange(this.events, start, end);
    const filteredSessions = Array.from(this.sessions.values())
      .filter(session => {
        const sessionStart = new Date(session.startTime);
        return sessionStart >= start && sessionStart <= end;
      });

    // Calculate metrics
    if (this.config.metrics.pageViews) {
      report.metrics.pageViews = {
        total: filteredPageViews.length,
        unique: new Set(filteredPageViews.map(pv => pv.url)).size,
        topPages: this.getTopPages(filteredPageViews)
      };
    }

    if (this.config.metrics.uniqueVisitors) {
      report.metrics.visitors = {
        total: new Set(filteredPageViews.map(pv => pv.ip)).size,
        returning: this.getReturningVisitors(filteredPageViews)
      };
    }

    if (this.config.metrics.sessionDuration) {
      const durations = filteredSessions
        .filter(s => s.duration)
        .map(s => s.duration);
      
      report.metrics.sessions = {
        total: filteredSessions.length,
        averageDuration: durations.length > 0 ? 
          Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 1000) : 0,
        bounceRate: this.calculateBounceRate(filteredSessions)
      };
    }

    if (this.config.metrics.devices) {
      report.metrics.devices = this.getDeviceStats(filteredPageViews);
    }

    if (this.config.metrics.referrers) {
      report.metrics.referrers = this.getReferrerStats(filteredPageViews);
    }

    // Performance metrics
    const filteredPerformance = this.filterByDateRange(this.performance, start, end);
    if (this.config.settings.trackPerformance && filteredPerformance.length > 0) {
      const loadTimes = filteredPerformance.map(p => p.loadTime).filter(t => t > 0);
      report.metrics.performance = {
        averageLoadTime: Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length),
        totalMeasurements: filteredPerformance.length
      };
    }

    // Store report
    this.reports[type].set(report.generatedAt, report);

    console.log(`📊 ${type} report generated for ${filteredPageViews.length} page views`);

    return report;
  }

  /**
   * Get analytics statistics
   */
  async getAnalyticsStats(requestData) {
    const stats = {
      ...requestData,
      statistics: {
        totalPageViews: this.pageViews.length,
        totalEvents: this.events.length,
        activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
        totalSessions: this.sessions.size,
        uniqueVisitors: new Set(this.pageViews.map(pv => pv.ip)).size,
        performanceRecords: this.performance.length,
        reportsGenerated: {
          daily: this.reports.daily.size,
          weekly: this.reports.weekly.size,
          monthly: this.reports.monthly.size
        }
      },
      generatedAt: new Date().toISOString()
    };

    return stats;
  }

  // Helper methods
  
  /**
   * Update visitor data
   */
  updateVisitorData(pageView) {
    const visitorKey = pageView.ip;
    
    if (!this.visitors.has(visitorKey)) {
      this.visitors.set(visitorKey, {
        firstVisit: pageView.timestamp,
        lastVisit: pageView.timestamp,
        pageViews: 1,
        sessions: new Set([pageView.sessionId])
      });
    } else {
      const visitor = this.visitors.get(visitorKey);
      visitor.lastVisit = pageView.timestamp;
      visitor.pageViews++;
      visitor.sessions.add(pageView.sessionId);
    }
  }

  /**
   * Update session data
   */
  updateSessionData(pageView) {
    const session = this.sessions.get(pageView.sessionId);
    if (session) {
      session.lastActivity = pageView.timestamp;
      session.pageViews++;
    }
  }

  /**
   * Parse device information from user agent
   */
  parseDevice(userAgent) {
    if (!userAgent) return { type: 'unknown', browser: 'unknown', os: 'unknown' };
    
    let deviceType = 'desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet/i.test(userAgent)) deviceType = 'tablet';

    let browser = 'unknown';
    if (/chrome/i.test(userAgent)) browser = 'chrome';
    else if (/firefox/i.test(userAgent)) browser = 'firefox';
    else if (/safari/i.test(userAgent)) browser = 'safari';
    else if (/edge/i.test(userAgent)) browser = 'edge';

    let os = 'unknown';
    if (/windows/i.test(userAgent)) os = 'windows';
    else if (/mac/i.test(userAgent)) os = 'macos';
    else if (/linux/i.test(userAgent)) os = 'linux';
    else if (/android/i.test(userAgent)) os = 'android';
    else if (/ios/i.test(userAgent)) os = 'ios';

    return { type: deviceType, browser, os };
  }

  /**
   * Anonymize IP address
   */
  anonymizeIP(ip) {
    if (!ip) return 'anonymous';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    return 'anonymous';
  }

  /**
   * Filter data by date range
   */
  filterByDateRange(data, start, end) {
    return data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    });
  }

  /**
   * Get top pages
   */
  getTopPages(pageViews, limit = 10) {
    const pageCounts = {};
    pageViews.forEach(pv => {
      pageCounts[pv.url] = (pageCounts[pv.url] || 0) + 1;
    });

    return Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([url, count]) => ({ url, count }));
  }

  /**
   * Calculate bounce rate
   */
  calculateBounceRate(sessions) {
    if (sessions.length === 0) return 0;
    
    const bouncedSessions = sessions.filter(s => s.pageViews <= 1).length;
    return Math.round((bouncedSessions / sessions.length) * 100);
  }

  /**
   * Get device statistics
   */
  getDeviceStats(pageViews) {
    const deviceCounts = {};
    pageViews.forEach(pv => {
      const deviceType = pv.device.type;
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
    });
    return deviceCounts;
  }

  /**
   * Get referrer statistics
   */
  getReferrerStats(pageViews) {
    const referrerCounts = {};
    pageViews.forEach(pv => {
      const referrer = pv.referrer || 'direct';
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });
    return referrerCounts;
  }

  /**
   * Get returning visitors count
   */
  getReturningVisitors(pageViews) {
    const visitorCounts = {};
    pageViews.forEach(pv => {
      visitorCounts[pv.ip] = (visitorCounts[pv.ip] || 0) + 1;
    });
    return Object.values(visitorCounts).filter(count => count > 1).length;
  }

  /**
   * Get default start date for report type
   */
  getDefaultStartDate(type) {
    const now = new Date();
    switch (type) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return weekStart;
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  }

  /**
   * Generate daily report automatically
   */
  async generateDailyReport() {
    return await this.generateReport({ type: 'daily' });
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Process generic analytics request
   */
  async processAnalyticsRequest(data) {
    return {
      ...data,
      analyticsReady: true,
      processedBy: 'Analytics Plugin',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate input data
   */
  validate(data) {
    return data && typeof data === 'object';
  }

  /**
   * Get plugin statistics
   */
  getStats() {
    return {
      ...this.getInfo(),
      dataCollected: {
        pageViews: this.pageViews.length,
        events: this.events.length,
        sessions: this.sessions.size,
        visitors: this.visitors.size,
        performanceRecords: this.performance.length
      },
      lastActivity: new Date().toISOString()
    };
  }
}