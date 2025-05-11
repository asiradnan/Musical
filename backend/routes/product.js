import express from 'express';
import { 
  getProducts, 
  getProductById, 
  getCategories, 
  getBrands,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.js';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { upload, uploadMultipleImages } from '../controllers/media.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:id', getProductById);

// Admin routes
router.post(
  '/', 
  auth, 
  isAdmin, 
  upload.array('images', 5), 
  uploadMultipleImages, 
  createProduct
);

router.put(
  '/:id', 
  auth, 
  isAdmin, 
  upload.array('images', 5), 
  uploadMultipleImages, 
  updateProduct
);

router.delete('/:id', auth, isAdmin, deleteProduct);

export default router;
