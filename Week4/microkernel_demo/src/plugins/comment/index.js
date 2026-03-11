import { PluginBase } from '../../core/plugin-base.js';

/**
 * Comment Plugin - Quản lý hệ thống bình luận
 */
export default class CommentPlugin extends PluginBase {
  constructor(name, config) {
    super(name, config);
    this.comments = new Map(); // Storage cho comments
    this.moderationQueue = [];
    this.statistics = {
      totalComments: 0,
      approvedComments: 0,
      pendingComments: 0,
      rejectedComments: 0
    };
  }

  async initialize() {
    await super.initialize();
    console.log('💬 Comment Plugin: Ready to manage comments');
    
    // Setup auto-backup if enabled
    if (this.config.storage.autoSave) {
      setInterval(() => {
        this.backupComments();
      }, this.config.storage.backupInterval);
    }
  }

  /**
   * Thực thi comment operations
   */
  async execute(data) {
    const { type, data: requestData } = data;
    
    let result = requestData;

    switch (type) {
      case 'comment:add':
        result = await this.addComment(requestData);
        break;
      
      case 'comment:get':
        result = await this.getComments(requestData);
        break;
      
      case 'comment:moderate':
        result = await this.moderateComment(requestData);
        break;
      
      case 'comment:delete':
        result = await this.deleteComment(requestData);
        break;
      
      case 'comment:reply':
        result = await this.addReply(requestData);
        break;

      case 'comment:stats':
        result = await this.getCommentStats(requestData);
        break;
      
      default:
        result = await this.processCommentRequest(requestData);
    }

    console.log(`💬 Comment Plugin processed: ${type}`);
    return result;
  }

  /**
   * Thêm comment mới
   */
  async addComment(commentData) {
    const comment = {
      id: this.generateCommentId(),
      postId: commentData.postId,
      author: commentData.author,
      email: commentData.email,
      content: commentData.content,
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, approved, rejected
      replies: [],
      likes: 0,
      reports: 0,
      ip: commentData.ip || 'unknown'
    };

    // Validate comment
    const validation = this.validateComment(comment);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        comment: null
      };
    }

    // Filter content
    comment.content = this.filterContent(comment.content);

    // Check if moderation is needed
    if (this.config.settings.requireApproval || this.needsModeration(comment)) {
      comment.status = 'pending';
      this.moderationQueue.push(comment);
      this.statistics.pendingComments++;
    } else {
      comment.status = 'approved';
      this.statistics.approvedComments++;
    }

    // Store comment
    const postComments = this.comments.get(comment.postId) || [];
    postComments.push(comment);
    this.comments.set(comment.postId, postComments);
    
    this.statistics.totalComments++;

    console.log(`💬 New comment added: ${comment.id} (${comment.status})`);

    return {
      success: true,
      comment: comment,
      status: comment.status,
      requiresModeration: comment.status === 'pending'
    };
  }

  /**
   * Lấy comments cho một post
   */
  async getComments(requestData) {
    const { postId, includeReplies = true, status = 'approved' } = requestData;
    
    const postComments = this.comments.get(postId) || [];
    
    let filteredComments = postComments.filter(comment => 
      status === 'all' || comment.status === status
    );

    // Format comments for display
    filteredComments = filteredComments.map(comment => ({
      ...comment,
      replies: includeReplies ? comment.replies : [],
      replyCount: comment.replies.length
    }));

    // Sort by timestamp
    filteredComments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
      postId: postId,
      comments: filteredComments,
      totalCount: filteredComments.length,
      retrievedAt: new Date().toISOString()
    };
  }

  /**
   * Moderate comment (approve/reject)
   */
  async moderateComment(moderationData) {
    const { commentId, action, reason } = moderationData; // action: 'approve' | 'reject'
    
    let comment = null;
    
    // Find comment across all posts
    for (const [postId, comments] of this.comments) {
      const foundComment = comments.find(c => c.id === commentId);
      if (foundComment) {
        comment = foundComment;
        break;
      }
    }

    if (!comment) {
      return {
        success: false,
        error: 'Comment not found'
      };
    }

    const oldStatus = comment.status;
    
    if (action === 'approve') {
      comment.status = 'approved';
      comment.approvedAt = new Date().toISOString();
      
      if (oldStatus === 'pending') {
        this.statistics.pendingComments--;
      }
      this.statistics.approvedComments++;
      
    } else if (action === 'reject') {
      comment.status = 'rejected';
      comment.rejectedAt = new Date().toISOString();
      comment.rejectionReason = reason;
      
      if (oldStatus === 'pending') {
        this.statistics.pendingComments--;
      }
      this.statistics.rejectedComments++;
    }

    // Remove from moderation queue
    this.moderationQueue = this.moderationQueue.filter(c => c.id !== commentId);

    console.log(`💬 Comment ${commentId} ${action}ed`);

    return {
      success: true,
      comment: comment,
      action: action,
      previousStatus: oldStatus
    };
  }

  /**
   * Xóa comment
   */
  async deleteComment(deleteData) {
    const { commentId } = deleteData;
    
    for (const [postId, comments] of this.comments) {
      const commentIndex = comments.findIndex(c => c.id === commentId);
      if (commentIndex > -1) {
        const comment = comments[commentIndex];
        comments.splice(commentIndex, 1);
        
        // Update statistics
        if (comment.status === 'approved') {
          this.statistics.approvedComments--;
        } else if (comment.status === 'pending') {
          this.statistics.pendingComments--;
        } else if (comment.status === 'rejected') {
          this.statistics.rejectedComments--;
        }
        this.statistics.totalComments--;

        console.log(`💬 Comment ${commentId} deleted`);
        
        return {
          success: true,
          deletedComment: comment
        };
      }
    }

    return {
      success: false,
      error: 'Comment not found'
    };
  }

  /**
   * Thêm reply cho comment
   */
  async addReply(replyData) {
    const { parentCommentId, author, email, content, ip } = replyData;
    
    let parentComment = null;
    
    // Find parent comment
    for (const [postId, comments] of this.comments) {
      const foundComment = comments.find(c => c.id === parentCommentId);
      if (foundComment) {
        parentComment = foundComment;
        break;
      }
    }

    if (!parentComment) {
      return {
        success: false,
        error: 'Parent comment not found'
      };
    }

    // Check reply depth
    const currentDepth = this.calculateReplyDepth(parentComment);
    if (currentDepth >= this.config.settings.maxReplyDepth) {
      return {
        success: false,
        error: 'Maximum reply depth exceeded'
      };
    }

    const reply = {
      id: this.generateCommentId(),
      parentId: parentCommentId,
      author: author,
      email: email,
      content: this.filterContent(content),
      timestamp: new Date().toISOString(),
      status: this.config.settings.requireApproval ? 'pending' : 'approved',
      ip: ip || 'unknown'
    };

    parentComment.replies.push(reply);
    
    if (reply.status === 'approved') {
      this.statistics.approvedComments++;
    } else {
      this.statistics.pendingComments++;
      this.moderationQueue.push(reply);
    }
    this.statistics.totalComments++;

    console.log(`💬 Reply added to comment ${parentCommentId}`);

    return {
      success: true,
      reply: reply,
      parentComment: parentComment
    };
  }

  /**
   * Lấy thống kê comments
   */
  async getCommentStats(requestData) {
    const totalPosts = this.comments.size;
    const moderationQueueSize = this.moderationQueue.length;
    
    return {
      ...requestData,
      statistics: {
        ...this.statistics,
        totalPosts: totalPosts,
        moderationQueueSize: moderationQueueSize,
        averageCommentsPerPost: totalPosts > 0 ? this.statistics.totalComments / totalPosts : 0
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate comment data
   */
  validateComment(comment) {
    if (!comment.content || comment.content.trim().length === 0) {
      return { valid: false, error: 'Comment content is required' };
    }

    if (comment.content.length > this.config.settings.maxCommentLength) {
      return { valid: false, error: 'Comment too long' };
    }

    if (!this.config.settings.allowGuestComments && !comment.email) {
      return { valid: false, error: 'Email is required' };
    }

    // Check blocked IPs
    if (this.config.filters.blockedIPs.includes(comment.ip)) {
      return { valid: false, error: 'IP address is blocked' };
    }

    // Check blocked emails
    if (this.config.filters.blockedEmails.includes(comment.email)) {
      return { valid: false, error: 'Email address is blocked' };
    }

    return { valid: true };
  }

  /**
   * Filter inappropriate content
   */
  filterContent(content) {
    let filtered = content;
    
    this.config.filters.badWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });

    return filtered;
  }

  /**
   * Check if comment needs moderation
   */
  needsModeration(comment) {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /http[s]?:\/\//gi, // Contains URLs
      /(.)\1{3,}/gi,     // Repeated characters
      /[A-Z]{5,}/g       // Too many caps
    ];

    return suspiciousPatterns.some(pattern => pattern.test(comment.content));
  }

  /**
   * Calculate reply depth
   */
  calculateReplyDepth(comment, depth = 0) {
    if (comment.replies.length === 0) {
      return depth;
    }
    
    let maxDepth = depth;
    comment.replies.forEach(reply => {
      const replyDepth = this.calculateReplyDepth(reply, depth + 1);
      maxDepth = Math.max(maxDepth, replyDepth);
    });
    
    return maxDepth;
  }

  /**
   * Generate unique comment ID
   */
  generateCommentId() {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Process generic comment request
   */
  async processCommentRequest(data) {
    return {
      ...data,
      commentSystemReady: true,
      processedBy: 'Comment Plugin',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Backup comments data
   */
  async backupComments() {
    console.log('💬 Backing up comments data...');
    // In production, this would save to file or database
    return {
      timestamp: new Date().toISOString(),
      totalComments: this.statistics.totalComments,
      status: 'backed_up'
    };
  }

  /**
   * Validate input data
   */
  validate(data) {
    return data && typeof data === 'object';
  }
}