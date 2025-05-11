import mongoose from 'mongoose';
import CollaborationPost from '../models/collaborationPost.js';
import Comment from '../models/comment.js';
import User from '../models/user.js';

// Get all collaboration posts
export const getPosts = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const { genre, location, search } = req.query;
    
    // Build filter
    const filter = {};
    
    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Find posts with filters, sort by newest first
    const posts = await CollaborationPost.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalPosts = await CollaborationPost.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      posts
    });
  } catch (error) {
    console.error('Error fetching collaboration posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration posts',
      error: error.message
    });
  }
};
// Create a new collaboration post
export const createPost = async (req, res) => {
    try {
      const { title, description, genre, location } = req.body;
      const userId = req.user.userId;
      
      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
      }
      
      // Create new post
      const newPost = new CollaborationPost({
        title,
        description,
        genre: genre || '',
        location: location || '',
        author: userId
      });
      
      await newPost.save();
      
      // Populate author info before sending response
      await newPost.populate('author', 'name');
      
      res.status(201).json({
        success: true,
        message: 'Collaboration post created successfully',
        post: newPost
      });
    } catch (error) {
      console.error('Error creating collaboration post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create collaboration post',
        error: error.message
      });
    }
  };
  
  // Get a specific post by ID
  export const getPostById = async (req, res) => {
    try {
      const { postId } = req.params;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Find post and populate author info
      const post = await CollaborationPost.findById(postId)
        .populate('author', 'name email');
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      res.status(200).json({
        success: true,
        post
      });
    } catch (error) {
      console.error('Error fetching collaboration post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch collaboration post',
        error: error.message
      });
    }
  };
  
  // Update a post
  export const updatePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { title, description, genre, location } = req.body;
      const userId = req.user.userId;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Find post
      const post = await CollaborationPost.findById(postId);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      // Check if user is the author
      if (post.author.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this post'
        });
      }
      
      // Update post fields
      post.title = title || post.title;
      post.description = description || post.description;
      post.genre = genre !== undefined ? genre : post.genre;
      post.location = location !== undefined ? location : post.location;
      post.updatedAt = Date.now();
      
      await post.save();
      
      res.status(200).json({
        success: true,
        message: 'Collaboration post updated successfully',
        post
      });
    } catch (error) {
      console.error('Error updating collaboration post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update collaboration post',
        error: error.message
      });
    }
  };
  
  // Delete a post
  export const deletePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Find post
      const post = await CollaborationPost.findById(postId);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      // Check if user is the author or an admin
      if (post.author.toString() !== userId && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this post'
        });
      }
      
      // Delete all comments associated with this post
      await Comment.deleteMany({ post: postId });
      
      // Delete the post
      await post.deleteOne();
      
      res.status(200).json({
        success: true,
        message: 'Collaboration post deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting collaboration post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete collaboration post',
        error: error.message
      });
    }
  };
  
  // Get comments for a post
  export const getComments = async (req, res) => {
    try {
      const { postId } = req.params;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Check if post exists
      const postExists = await CollaborationPost.exists({ _id: postId });
      
      if (!postExists) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      // Get comments for the post
      const comments = await Comment.find({ post: postId })
        .populate('author', 'name')
        .sort({ createdAt: 1 });
      
      res.status(200).json({
        success: true,
        comments
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error.message
      });
    }
  };
  
  // Add a comment to a post
  export const addComment = async (req, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID format'
        });
      }
      
      // Check if content is provided
      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }
      
      // Check if post exists
      const post = await CollaborationPost.findById(postId);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Collaboration post not found'
        });
      }
      
      // Create new comment
      const newComment = new Comment({
        content,
        author: userId,
        post: postId
      });
      
      await newComment.save();
      await newComment.populate('author', 'name');
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment: newComment
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message
      });
    }
  };
  
  // Delete a comment
  export const deleteComment = async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid comment ID format'
        });
      }
      
      // Find comment
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      
      // Check if user is the author of the comment, the author of the post, or an admin
      const isCommentAuthor = comment.author.toString() === userId;
      let isPostAuthor = false;
      
      if (!isCommentAuthor) {
        const post = await CollaborationPost.findById(comment.post);
        isPostAuthor = post && post.author.toString() === userId;
      }
      
      if (!isCommentAuthor && !isPostAuthor && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this comment'
        });
      }
      
      // Delete the comment
      await comment.deleteOne();
      
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: error.message
      });
    }
  };
  