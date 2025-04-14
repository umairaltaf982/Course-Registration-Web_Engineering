const express = require('express');
const router = express.Router();
const { requireStudentLogin } = require('../middleware/sessionMiddleware');
const studentViewsController = require('../controllers/studentViewsController');


router.get('/dashboard', requireStudentLogin, studentViewsController.getDashboard);


router.get('/schedule', requireStudentLogin, studentViewsController.getSchedule);


router.get('/courses', requireStudentLogin, studentViewsController.getCourses);


router.post('/add-to-temp', requireStudentLogin, studentViewsController.addToTemp);


router.post('/remove-from-temp', requireStudentLogin, studentViewsController.removeFromTemp);


router.get('/temp-schedule', requireStudentLogin, studentViewsController.getTempSchedule);


router.post('/register', requireStudentLogin, studentViewsController.register);


router.post('/save-schedule', requireStudentLogin, studentViewsController.saveSchedule);


router.get('/api/courses/departments', studentViewsController.getCourseDepartments);


router.get('/notifications', requireStudentLogin, studentViewsController.getNotifications);


router.post('/subscribe', requireStudentLogin, studentViewsController.subscribe);


router.post('/unsubscribe', requireStudentLogin, studentViewsController.unsubscribe);

module.exports = router;