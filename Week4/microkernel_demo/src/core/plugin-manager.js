import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Plugin Manager - Quản lý tất cả plugins trong hệ thống
 */
export class PluginManager {
  constructor() {
    this.plugins = new Map(); // Plugin registry
    this.pluginOrder = []; // Thứ tự execute plugins
    this.hooks = new Map(); // Event hooks system
  }

  /**
   * Tự động load tất cả plugins từ thư mục plugins
   */
  async loadAll(pluginsDir = path.join(__dirname, '../plugins')) {
    try {
      if (!fs.existsSync(pluginsDir)) {
        console.warn('Plugins directory not found:', pluginsDir);
        return;
      }

      const pluginDirs = fs.readdirSync(pluginsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      console.log('🔌 Loading plugins:', pluginDirs);

      for (const pluginDir of pluginDirs) {
        await this.loadPlugin(pluginDir, pluginsDir);
      }

      console.log(`✅ Successfully loaded ${this.plugins.size} plugins`);
    } catch (error) {
      console.error('❌ Error loading plugins:', error.message);
    }
  }

  /**
   * Load một plugin cụ thể
   */
  async loadPlugin(pluginName, pluginsDir = path.join(__dirname, '../plugins')) {
    try {
      const pluginPath = path.join(pluginsDir, pluginName);
      const indexPath = path.join(pluginPath, 'index.js');
      const configPath = path.join(pluginPath, 'config.json');

      // Đọc config plugin
      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }

      // Import plugin class
      const pluginModule = await import(`file://${indexPath}`);
      const PluginClass = pluginModule.default;

      // Tạo instance plugin
      const plugin = new PluginClass(pluginName, config);
      
      // Đăng ký plugin
      this.plugins.set(pluginName, plugin);
      this.pluginOrder.push(pluginName);

      // Khởi tạo plugin
      await plugin.initialize();

      console.log(`✅ Plugin '${pluginName}' loaded successfully`);
      return plugin;

    } catch (error) {
      console.error(`❌ Failed to load plugin '${pluginName}':`, error.message);
      throw error;
    }
  }

  /**
   * Unload plugin
   */
  async unloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      await plugin.destroy();
      this.plugins.delete(pluginName);
      const index = this.pluginOrder.indexOf(pluginName);
      if (index > -1) {
        this.pluginOrder.splice(index, 1);
      }
      console.log(`🔌 Plugin '${pluginName}' unloaded`);
    }
  }

  /**
   * Lấy plugin theo tên
   */
  getPlugin(name) {
    return this.plugins.get(name);
  }

  /**
   * Lấy danh sách tất cả plugins
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Thực thi tất cả plugins với data
   */
  async executeAll(data = {}) {
    const results = [];
    
    for (const pluginName of this.pluginOrder) {
      const plugin = this.plugins.get(pluginName);
      if (plugin && plugin.isEnabled) {
        try {
          if (plugin.validate(data)) {
            const result = await plugin.execute(data);
            results.push({
              plugin: pluginName,
              success: true,
              result: result
            });
          }
        } catch (error) {
          console.error(`❌ Plugin '${pluginName}' execution failed:`, error.message);
          results.push({
            plugin: pluginName,
            success: false,
            error: error.message
          });
        }
      }
    }

    return results;
  }

  /**
   * Thực thi plugin cụ thể
   */
  async executePlugin(pluginName, data = {}) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin '${pluginName}' not found`);
    }

    if (!plugin.isEnabled) {
      throw new Error(`Plugin '${pluginName}' is disabled`);
    }

    if (!plugin.validate(data)) {
      throw new Error(`Plugin '${pluginName}' validation failed`);
    }

    return await plugin.execute(data);
  }

  /**
   * Lấy thông tin tất cả plugins
   */
  getPluginsInfo() {
    return this.pluginOrder.map(name => {
      const plugin = this.plugins.get(name);
      return plugin ? plugin.getInfo() : null;
    }).filter(info => info !== null);
  }

  /**
   * Enable/Disable plugin
   */
  togglePlugin(pluginName, enabled) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.setEnabled(enabled);
    }
  }
}