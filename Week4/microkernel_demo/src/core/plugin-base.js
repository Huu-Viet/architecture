/**
 * Base Plugin Class - Class cha cho tất cả plugins
 */
export class PluginBase {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.isEnabled = config.enabled !== false;
    this.version = config.version || '1.0.0';
  }

  /**
   * Khởi tạo plugin - method cần được override bởi plugin con
   */
  async initialize() {
    console.log(`Plugin ${this.name} initialized`);
  }

  /**
   * Thực thi chức năng chính của plugin - method cần được override
   */
  async execute(data = {}) {
    console.log(`Plugin ${this.name} executed with data:`, data);
    return data;
  }

  /**
   * Dọn dẹp tài nguyên khi plugin được unload
   */
  async destroy() {
    console.log(`Plugin ${this.name} destroyed`);
  }

  /**
   * Lấy thông tin plugin
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      enabled: this.isEnabled,
      config: this.config
    };
  }

  /**
   * Bật/tắt plugin
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`Plugin ${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Validate hook - kiểm tra input trước khi thực thi
   */
  validate(data) {
    return true;
  }
}