import express from 'express';
import userController from '../controller/userController.js';
import { AuthCheck } from '../middleware/authCheck.js';
import categoryController from '../controller/categoryController.js';
import productController from '../controller/productController.js';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World!');
});


// Authentication Routes
router.post('/register', userController.register);
router.post('/verify', userController.verifyEmail);
router.post('/login', userController.login);
router.get('/profile',AuthCheck, userController.profile);
router.post('/editProfile',AuthCheck, userController.updateProfile);

// Category Routes

router.post("createCategory", AuthCheck, categoryController.createCategory);
router.get("getCategories", AuthCheck, categoryController.getCategories);
router.get("getCategoryById/:id", AuthCheck, categoryController.getCategoryById);
router.put("updateCategory/:id", AuthCheck, categoryController.updateCategory);
router.delete("deleteCategory/:id", AuthCheck, categoryController.deleteCategory);

// Product Routes

router.post("create-product", AuthCheck, productController.createProduct);
router.get("getProducts", AuthCheck, productController.getProducts);
router.get("getProductById/:id", AuthCheck, productController.getProductById);
router.put("updateProduct/:id", AuthCheck, productController.updateProduct);
router.delete("deleteProduct/:id", AuthCheck, productController.deleteProduct);
router.get("getOutOfStockProducts", AuthCheck, productController.getOutOfStockProducts);

export default router;