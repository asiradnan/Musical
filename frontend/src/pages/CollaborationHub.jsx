import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';

const CollaborationHub = () => {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', description: '', genre: '', location: '' });
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAuthenticated) {
          const authResult = await checkAuth();
          if (!authResult) {
            navigate('/login');
            return;
          }
        }
        
        // Check if user is an artist
        if (user && user.role !== 'artist') {
          setError('This feature is only available to artists');
          setLoading(false);
          return;
        }
        
        fetchPosts();
      } catch (err) {
        setError('Failed to load collaboration hub. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, isAuthenticated, checkAuth, user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/collaboration/posts');
      setPosts(response.data.posts);
      setLoading(false);
    } catch (err) {
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await api.get(`/collaboration/posts/${postId}/comments`);
      setComments(prev => ({
        ...prev,
        [postId]: response.data.comments
      }));
    } catch (err) {
      setError('Failed to load comments');
    }
  };

  const handleInputChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleCommentChange = (postId, value) => {
    setNewComment({ ...newComment, [postId]: value });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!newPost.title.trim() || !newPost.description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      const response = await api.post('/collaboration/posts', newPost);
      setPosts([response.data.post, ...posts]);
      setNewPost({ title: '', description: '', genre: '', location: '' });
      setMessage('Post created successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleAddComment = async (postId) => {
    setError(null);

    // Basic validation
    if (!newComment[postId] || !newComment[postId].trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const response = await api.post(`/collaboration/posts/${postId}/comments`, {
        content: newComment[postId]
      });
      
      // Update comments for this post
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data.comment]
      }));
      
      // Clear the comment input
      setNewComment({ ...newComment, [postId]: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const toggleComments = (postId) => {
    if (!comments[postId]) {
      // If comments aren't loaded yet, fetch them
      fetchComments(postId);
    } else {
      // If comments are already loaded, remove them from state to hide them
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[postId];
        return newComments;
      });
    }
  };
  

  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-white text-xl">Loading collaboration hub...</p>
        </div>
      </div>
    );

  // If user is not an artist, show restricted access message
  if (user && user.role !== 'artist') {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">Musician Collaboration Hub</h1>
          <div className="bg-red-500 text-white p-4 rounded-md mb-6">
            This feature is only available to artists. Please upgrade your account to access the collaboration hub.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar />
      <div className="flex-1 p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Musician Collaboration Hub</h1>

          {message && (
            <div className="bg-green-500 text-white p-4 rounded-md mb-6">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Create Post Form */}
          <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl mb-8 border border-white/30 text-white">
            <h2 className="text-2xl font-semibold mb-6">Create a Collaboration Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label htmlFor="title" className="block mb-2 font-medium">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newPost.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Looking for a drummer for weekend jam sessions"
                  className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                />
              </div>
              <div>
                <label htmlFor="description" className="block mb-2 font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newPost.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you're looking for, your experience, etc."
                  rows="4"
                  className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="genre" className="block mb-2 font-medium">
                    Genre
                  </label>
                  <input
                    type="text"
                    id="genre"
                    name="genre"
                    value={newPost.genre}
                    onChange={handleInputChange}
                    placeholder="E.g., Rock, Jazz, Hip-Hop"
                    className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block mb-2 font-medium">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newPost.location}
                    onChange={handleInputChange}
                    placeholder="E.g., New York, Remote"
                    className="w-full p-3 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Post Collaboration
              </button>
            </form>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 text-white">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.genre && (
                        <span className="px-3 py-1 bg-purple-800/60 rounded-full text-sm">
                          {post.genre}
                        </span>
                      )}
                      {post.location && (
                        <span className="px-3 py-1 bg-blue-800/60 rounded-full text-sm">
                          {post.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mb-4">{post.description}</p>
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>Posted by {post.author.name}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Comments section */}
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <button 
                      onClick={() => toggleComments(post._id)}
                      className="text-blue-400 hover:text-blue-300 mb-4"
                    >
                      {comments[post._id] ? 'Hide Comments' : 'Show Comments'}
                    </button>
                    
                    {comments[post._id] && (
                      <div className="space-y-4">
                        {comments[post._id].length > 0 ? (
                          comments[post._id].map((comment) => (
                            <div key={comment._id} className="bg-white/10 p-3 rounded-lg">
                              <p>{comment.content}</p>
                              <div className="flex justify-between items-center mt-2 text-sm text-white/60">
                                <span>{comment.author.name}</span>
                                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-white/60">No comments yet. Be the first to comment!</p>
                        )}
                        
                        {/* Add comment form */}
                        <div className="mt-4 flex gap-2">
                          <input
                            type="text"
                            value={newComment[post._id] || ''}
                            onChange={(e) => handleCommentChange(post._id, e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-grow p-2 border rounded-md text-base bg-white/10 text-white placeholder-white/60 border-white/30"
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-black/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 text-white text-center">
                <p>No collaboration posts yet. Be the first to create one!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationHub;
