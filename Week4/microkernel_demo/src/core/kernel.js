import { PluginManager } from './plugin-manager.js';

/**
 * Core Kernel - Trái tim của Microkernel Architecture
 * Cung cấp chức năng cơ bản và quản lý plugins
 */
export class MicrokernelCore {
  constructor() {
    this.pluginManager = new PluginManager();
    this.isInitialized = false;
    this.services = new Map(); // Core services
    this.eventListeners = new Map(); // Event system
  }

  /**
   * Khởi tạo kernel và load plugins
   */
  async initialize() {
    console.log('🚀 Initializing Microkernel...');
    
    try {
      // Load tất cả plugins
      await this.pluginManager.loadAll();
      
      this.isInitialized = true;
      console.log('✅ Microkernel initialized successfully');
      
      this.emit('kernel:initialized', { timestamp: new Date() });
      
    } catch (error) {
      console.error('❌ Kernel initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Xử lý request qua plugin pipeline
   */
  async processRequest(requestType, data = {}) {
    if (!this.isInitialized) {
      throw new Error('Kernel not initialized');
    }

    console.log(`🔄 Processing request: ${requestType}`);
    
    const requestData = {
      type: requestType,
      data: data,
      timestamp: new Date(),
      requestId: this.generateId()
    };

    // Emit event trước khi xử lý
    this.emit('request:start', requestData);

    try {
      // Thực thi tất cả plugins
      const results = await this.pluginManager.executeAll(requestData);
      
      const response = {
        requestId: requestData.requestId,
        success: true,
        results: results,
        processedAt: new Date()
      };

      // Emit event sau khi xử lý
      this.emit('request:complete', response);
      
      return response;

    } catch (error) {
      console.error('❌ Request processing failed:', error.message);
      
      const errorResponse = {
        requestId: requestData.requestId,
        success: false,
        error: error.message,
        processedAt: new Date()
      };

      this.emit('request:error', errorResponse);
      return errorResponse;
    }
  }

  /**
   * Đăng ký service vào kernel
   */
  registerService(name, service) {
    this.services.set(name, service);
    console.log(`🔧 Service '${name}' registered`);
  }

  /**
   * Lấy service đã đăng ký
   */
  getService(name) {
    return this.services.get(name);
  }

  /**
   * Event system - đăng ký listener
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Event system - emit event
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event listener error for '${event}':`, error.message);
      }
    });
  }

  /**
   * Lấy thông tin hệ thống
   */
  getSystemInfo() {
    return {
      initialized: this.isInitialized,
      plugins: this.pluginManager.getPluginsInfo(),
      services: Array.from(this.services.keys()),
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }

  /**
   * Quản lý plugins thông qua kernel
   */
  async loadPlugin(pluginName) {
    return await this.pluginManager.loadPlugin(pluginName);
  }

  async unloadPlugin(pluginName) {
    return await this.pluginManager.unloadPlugin(pluginName);
  }

  togglePlugin(pluginName, enabled) {
    this.pluginManager.togglePlugin(pluginName, enabled);
  }

  getPlugins() {
    return this.pluginManager.getAllPlugins();
  }

  /**
   * Shutdown kernel
   */
  async shutdown() {
    console.log('🔄 Shutting down kernel...');
    
    // Unload tất cả plugins
    const plugins = this.pluginManager.getAllPlugins();
    for (const plugin of plugins) {
      await this.pluginManager.unloadPlugin(plugin.name);
    }

    this.isInitialized = false;
    console.log('✅ Kernel shutdown complete');
  }

  /**
   * Tạo ID duy nhất
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}