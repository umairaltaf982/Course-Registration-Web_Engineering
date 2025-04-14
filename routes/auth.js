const express = require('express');
const router = express.Router();
const { authenticateStudent, authenticateAdmin } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');


router.get('/student-login', authController.getStudentLogin);


router.post('/student-login', authenticateStudent, authController.postStudentLogin);


router.get('/admin-login', authController.getAdminLogin);


router.post('/admin-login', authenticateAdmin, authController.postAdminLogin);


router.get('/logout', authController.logout);

module.exports = router;