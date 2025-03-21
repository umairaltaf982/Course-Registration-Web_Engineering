const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Student Routes
router.post('/login', studentController.loginStudent);
router.get('/courses', studentController.getCourses);
router.post('/register', studentController.registerCourse);
router.get('/schedule', studentController.getStudentSchedule);


module.exports = router;
