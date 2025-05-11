// routes/route.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { upload, uploadSingleImage, uploadMultipleImages, deleteImage } from '../controllers/media.js';

const router = express.Router();

// Import controllers (these would need to be created)
import * as authController from '../controllers/auth.js';
import * as userController from '../controllers/user.js';
import * as adminController from '../controllers/admin.js';
import * as collaborationController from '../controllers/collaboration.js';
import * as studioController from '../controllers/studio.js';
import * as bookingController from '../controllers/booking.js';
import * as rewardController from '../controllers/reward.js';
import * as productController from '../controllers/product.js';
// Add these routes to your existing routes file

// Reward system routes
// User-facing routes
router.get('/users/points', auth, (req, res) => {
  rewardController.getUserPoints(req, res);
});

router.get('/users/:userId/points', auth, (req, res) => {
  rewardController.getUserPoints(req, res);
});

// Admin routes for reward system management
router.post('/admin/rewards/points', auth, isAdmin, (req, res) => {
  rewardController.addPoints(req, res);
});

router.get('/admin/rewards/config', auth, isAdmin, (req, res) => {
  rewardController.getRewardConfig(req, res);
});

router.put('/admin/rewards/config', auth, isAdmin, (req, res) => {
  rewardController.updateRewardConfig(req, res);
});

router.post('/admin/rewards/process-expired', auth, isAdmin, (req, res) => {
  rewardController.processExpiredPoints(req, res);
});
// Add this to your existing reward system routes section
router.get('/rewards/user/:userId', auth, (req, res) => {
  rewardController.getUserRewards(req, res);
});


// Add this to the existing reward system routes section
// User-facing route to add points (for purchases)
router.post('/rewards/points', auth, (req, res) => {
  rewardController.addUserPoints(req, res);
});

// Authentication routes
router.post('/auth/register', (req, res) => {
  authController.register(req, res);
});

router.post('/auth/login', (req, res) => {
  authController.login(req, res);
  // res.status(200).json({ message: 'Login route' });
});

router.post('/auth/verify-email', (req, res) => {
  authController.verifyEmail(req, res);
  // res.status(200).json({ message: 'Verify email route' });
});

router.post('/auth/forgot-password', (req, res) => {
  authController.forgotPassword(req, res);
  // res.status(200).json({ message: 'Forgot password route' });
});

router.post('/auth/reset-password', (req, res) => {
  authController.resetPassword(req, res);
  // res.status(200).json({ message: 'Reset password route' });
});

router.post('/auth/logout', auth, (req, res) => {
  authController.logout(req, res);
  // res.status(200).json({ message: 'Logout route' });
});

router.post('/auth/refresh-token', (req, res) => {
  authController.refreshToken(req, res);
  // res.status(200).json({ message: 'Refresh token route' });
});

router.post('/auth/resend-verification', (req, res) => {
  authController.resendVerificationEmail(req, res);
});

// User routes
router.get('/users/profile', auth, (req, res) => {
  userController.getProfile(req, res);
  // res.status(200).json({ message: 'Get profile route' });
});

router.put('/users/profile', auth, (req, res) => {
  userController.updateProfile(req, res);
});

router.put('/users/change-password', auth, (req, res) => {
  userController.changePassword(req, res);
});


//invitation
router.post('/users/send-invitation', auth, (req, res) => {
  userController.sendInvitation(req, res);
});

router.get('/users/:userId/profile', (req, res) => {
  userController.getUserProfileById(req, res);
});


// Admin routes
router.get('/admin/users', auth, isAdmin, (req, res) => {
  adminController.getAllUsers(req, res);
  // res.status(200).json({ message: 'Get all users route' });
});

router.get('/admin/users/search', auth, isAdmin, (req, res) => {
  adminController.searchUsersByUsername(req, res);
  // res.status(200).json({ message: 'Search users by username route' });
});

router.post('/admin/users', auth, isAdmin, (req, res) => {
  adminController.addUser(req, res);
  // res.status(200).json({ message: 'Add user route' });
});

router.delete('/admin/users/:userId', auth, isAdmin, (req, res) => {
  adminController.deleteUser(req, res);
});
// Add these routes to your existing admin routes file

// Booking management routes
router.get('/bookings', auth, isAdmin, adminController.getAllBookings);
router.put('/bookings/:bookingId/cancel', auth, adminController.cancelBooking);





// Upload single image
router.post('/upload', auth, upload.single('image'), uploadSingleImage);

// Upload multiple images
router.post('/upload-multiple', auth, upload.array('images', 5), uploadMultipleImages);

// Delete image
router.delete('/:filename', auth, deleteImage);



// Collaboration routes
router.get('/collaboration/posts', auth, (req, res) => {
  collaborationController.getPosts(req, res);
});

router.post('/collaboration/posts', auth, (req, res) => {
  collaborationController.createPost(req, res);
});

router.get('/collaboration/posts/:postId', auth, (req, res) => {
  collaborationController.getPostById(req, res);
});

router.put('/collaboration/posts/:postId', auth, (req, res) => {
  collaborationController.updatePost(req, res);
});

router.delete('/collaboration/posts/:postId', auth, (req, res) => {
  collaborationController.deletePost(req, res);
});

router.get('/collaboration/posts/:postId/comments', auth, (req, res) => {
  collaborationController.getComments(req, res);
});

router.post('/collaboration/posts/:postId/comments', auth, (req, res) => {
  collaborationController.addComment(req, res);
});

router.delete('/collaboration/comments/:commentId', auth, (req, res) => {
  collaborationController.deleteComment(req, res);
});


// Artist release routes
router.get('/users/releases', auth, (req, res) => {
  userController.getUserReleases(req, res);
});

router.post('/users/releases', auth, (req, res) => {
  userController.addRelease(req, res);
});

router.delete('/users/releases/:releaseId', auth, (req, res) => {
  userController.deleteRelease(req, res);
});

// Studio routes
router.post('/studios', auth, isAdmin, upload.array('images', 5), (req, res) => {
  studioController.createStudio(req, res);
});

router.get('/studios', (req, res) => {
  studioController.getAllStudios(req, res);
});

router.get('/studios/:studioId', (req, res) => {
  studioController.getStudioById(req, res);
});

router.put('/studios/:studioId', auth, isAdmin, upload.array('images', 5), (req, res) => {
  studioController.updateStudio(req, res);
});

router.delete('/studios/:studioId', auth, isAdmin, (req, res) => {
  studioController.deleteStudio(req, res);
});

router.get('/studios/:studioId/availability', (req, res) => {
  studioController.checkStudioAvailability(req, res);
});

// Booking routes
router.post('/bookings', auth, (req, res) => {
  bookingController.createBooking(req, res);
});

router.get('/bookings/user', auth, (req, res) => {
  bookingController.getUserBookings(req, res);
});

router.get('/bookings/:bookingId', auth, (req, res) => {
  bookingController.getBookingById(req, res);
});

router.put('/bookings/:bookingId/status', auth, (req, res) => {
  bookingController.updateBookingStatus(req, res);
});

router.put('/bookings/:bookingId/payment', auth, isAdmin, (req, res) => {
  bookingController.updatePaymentStatus(req, res);
});

router.get('/studios/:studioId/bookings', auth, isAdmin, (req, res) => {
  bookingController.getStudioBookings(req, res);
});

router.get('/bookings', auth, isAdmin, (req, res) => {
  bookingController.getAllBookings(req, res);
});

router.put('/bookings/:bookingId/cancel', auth, (req, res) => {
  bookingController.cancelBooking(req, res);
});

// Product comment routes
router.get('/products/:productId/comments', auth, (req, res) => {
  productController.getProductComments(req, res);
});

router.post('/products/:productId/comments', auth, (req, res) => {
  productController.addProductComment(req, res);
});

router.delete('/products/comments/:commentId', auth, (req, res) => {
  productController.deleteProductComment(req, res);
});


export default router;