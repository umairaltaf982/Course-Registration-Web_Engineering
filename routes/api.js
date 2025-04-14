const express = require('express');
const router = express.Router();
const { requireAdminLogin, requireStudentLogin } = require('../middleware/sessionMiddleware');
const apiController = require('../controllers/apiController');


router.get('/courses', apiController.getCourses);


router.get('/courses/:id', apiController.getCourseById);


router.get('/students', requireAdminLogin, apiController.getStudents);


router.post('/students', requireAdminLogin, apiController.createStudent);


router.put('/students/:id', requireAdminLogin, apiController.updateStudent);


router.post('/students/remove-course', requireStudentLogin, apiController.removeStudentCourse);


router.post('/students/:id/remove-course', requireAdminLogin, apiController.adminRemoveStudentCourse);


router.post('/students/:id/add-course', requireAdminLogin, apiController.adminAddStudentCourse);

module.exports = router;