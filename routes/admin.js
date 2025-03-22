const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.loginAdmin);
router.post('/courses', adminController.addCourse);
router.delete('/courses/:id', adminController.deleteCourse);
router.get('/students', adminController.getAllStudents);

module.exports = router;
