const express = require('express');
const router = express.Router();
const { requireAdminLogin } = require('../middleware/sessionMiddleware');
const adminController = require('../controllers/adminController');


router.get('/', requireAdminLogin, adminController.getAllAdmins);


router.post('/register', adminController.registerAdmin);

module.exports = router;