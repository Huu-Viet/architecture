import { PluginBase } from '../../core/plugin-base.js';

/**
 * SEO Plugin - Tối ưu hóa SEO cho website
 */
export default class SeoPlugin extends PluginBase {
  constructor(name, config) {
    super(name, config);
    this.seoData = new Map();
  }

  async initialize() {
    await super.initialize();
    console.log('🔍 SEO Plugin: Ready to optimize your content');
  }

  /**
   * Thực thi SEO optimization
   */
  async execute(data) {
    const { type, data: requestData } = data;
    
    let result = requestData;

    switch (type) {
      case 'page:render':
        result = await this.optimizePage(requestData);
        break;
      
      case 'content:analyze':
        result = await this.analyzeContent(requestData);
        break;
      
      case 'sitemap:generate':
        result = await this.generateSitemap(requestData);
        break;
      
      default:
        result = await this.addBasicSEO(requestData);
    }

    console.log(`🔍 SEO Plugin processed: ${type}`);
    return result;
  }

  /**
   * Optimize trang web
   */
  async optimizePage(pageData) {
    const optimized = { ...pageData };
    const settings = this.config.settings;

    // Thêm meta tags cơ bản
    optimized.seo = {
      title: this.optimizeTitle(pageData.title || settings.defaultTitle),
      description: this.optimizeDescription(pageData.description || settings.defaultDescription),
      keywords: this.optimizeKeywords(pageData.keywords || settings.defaultKeywords),
      metaTags: this.generateMetaTags(pageData),
      canonicalUrl: pageData.url,
      lastModified: new Date().toISOString()
    };

    // Thêm structured data
    optimized.seo.structuredData = this.generateStructuredData(pageData);

    // Lưu SEO data để tracking
    this.seoData.set(pageData.url || 'unknown', optimized.seo);

    return optimized;
  }

  /**
   * Phân tích nội dung SEO
   */
  async analyzeContent(contentData) {
    const analysis = {
      ...contentData,
      seoScore: 0,
      recommendations: [],
      issues: []
    };

    const content = contentData.content || '';
    const title = contentData.title || '';

    // Kiểm tra title
    if (title.length === 0) {
      analysis.issues.push('Missing title');
    } else if (title.length > this.config.rules.maxTitleLength) {
      analysis.issues.push(`Title too long (${title.length}>${this.config.rules.maxTitleLength})`);
    } else {
      analysis.seoScore += 20;
    }

    // Kiểm tra description
    if (contentData.description) {
      if (contentData.description.length > this.config.rules.maxDescriptionLength) {
        analysis.issues.push('Description too long');
      } else {
        analysis.seoScore += 15;
      }
    } else {
      analysis.issues.push('Missing meta description');
      analysis.recommendations.push('Add meta description');
    }

    // Kiểm tra keywords
    if (contentData.keywords && contentData.keywords.length > 0) {
      analysis.seoScore += 10;
    } else {
      analysis.recommendations.push('Add relevant keywords');
    }

    // Kiểm tra nội dung
    if (content.length > 300) {
      analysis.seoScore += 25;
    } else {
      analysis.recommendations.push('Add more content (minimum 300 characters)');
    }

    // Kiểm tra headings
    const headings = (content.match(/<h[1-6]>/gi) || []).length;
    if (headings > 0) {
      analysis.seoScore += 15;
    } else {
      analysis.recommendations.push('Use heading tags (H1, H2, etc.)');
    }

    // Kiểm tra images với alt text
    const images = (content.match(/<img[^>]+alt/gi) || []).length;
    const totalImages = (content.match(/<img/gi) || []).length;
    
    if (totalImages > 0 && images === totalImages) {
      analysis.seoScore += 15;
    } else if (totalImages > 0) {
      analysis.recommendations.push('Add alt text to all images');
    }

    // Đánh giá tổng thể
    if (analysis.seoScore >= 80) {
      analysis.grade = 'Excellent';
    } else if (analysis.seoScore >= 60) {
      analysis.grade = 'Good';
    } else if (analysis.seoScore >= 40) {
      analysis.grade = 'Fair';
    } else {
      analysis.grade = 'Poor';
    }

    return analysis;
  }

  /**
   * Tạo sitemap
   */
  async generateSitemap(siteData) {
    const sitemap = {
      ...siteData,
      sitemap: {
        urls: [],
        generatedAt: new Date().toISOString(),
        totalPages: 0
      }
    };

    // Lấy tất cả URL đã được SEO optimize
    for (const [url, seoInfo] of this.seoData) {
      sitemap.sitemap.urls.push({
        url: url,
        lastModified: seoInfo.lastModified,
        priority: this.calculatePriority(url),
        changeFrequency: 'weekly'
      });
    }

    sitemap.sitemap.totalPages = sitemap.sitemap.urls.length;

    return sitemap;
  }

  /**
   * Thêm SEO cơ bản
   */
  async addBasicSEO(data) {
    return {
      ...data,
      seoEnhanced: true,
      processedBy: 'SEO Plugin',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Tối ưu hóa title
   */
  optimizeTitle(title) {
    if (title.length > this.config.rules.maxTitleLength) {
      return title.substring(0, this.config.rules.maxTitleLength - 3) + '...';
    }
    return title;
  }

  /**
   * Tối ưu hóa description
   */
  optimizeDescription(description) {
    if (description.length > this.config.rules.maxDescriptionLength) {
      return description.substring(0, this.config.rules.maxDescriptionLength - 3) + '...';
    }
    return description;
  }

  /**
   * Tối ưu hóa keywords
   */
  optimizeKeywords(keywords) {
    if (Array.isArray(keywords)) {
      return keywords.slice(0, this.config.rules.maxKeywords);
    }
    return keywords;
  }

  /**
   * Tạo meta tags
   */
  generateMetaTags(pageData) {
    const metaTags = [];
    
    if (this.config.settings.robotsAllowed) {
      metaTags.push({ name: 'robots', content: 'index,follow' });
    }
    
    metaTags.push({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
    metaTags.push({ property: 'og:type', content: 'website' });
    
    if (pageData.title) {
      metaTags.push({ property: 'og:title', content: pageData.title });
    }

    return metaTags;
  }

  /**
   * Tạo structured data
   */
  generateStructuredData(pageData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': pageData.title,
      'description': pageData.description,
      'url': pageData.url,
      'dateModified': new Date().toISOString()
    };
  }

  /**
   * Tính priority cho sitemap
   */
  calculatePriority(url) {
    if (url === '/' || url.includes('home')) return 1.0;
    if (url.includes('about') || url.includes('contact')) return 0.8;
    return 0.6;
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
      optimizedPages: this.seoData.size,
      lastActivity: new Date().toISOString()
    };
  }
}