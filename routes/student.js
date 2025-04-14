const express = require('express');
const router = express.Router();
const { requireAdminLogin } = require('../middleware/sessionMiddleware');
const studentController = require('../controllers/studentController');


router.get('/', requireAdminLogin, studentController.getAllStudents);


router.get('/:id', requireAdminLogin, studentController.getStudentById);


router.post('/', requireAdminLogin, studentController.createStudent);


router.put('/:id', requireAdminLogin, studentController.updateStudent);


router.post('/:id/add-course', requireAdminLogin, studentController.addCourseToStudent);


router.post('/students/:id/remove-course', requireAdminLogin, studentController.removeCourseFromStudent);

module.exports = router;