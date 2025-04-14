const express = require('express');
const router = express.Router();
const { requireAdminLogin } = require('../middleware/sessionMiddleware');
const courseController = require('../controllers/courseController');


router.get('/', courseController.getAllCourses);


router.get('/:id', courseController.getCourseById);


router.post('/', requireAdminLogin, courseController.createCourse);


router.put('/:id', requireAdminLogin, courseController.updateCourse);


router.delete('/:id', requireAdminLogin, courseController.deleteCourse);

module.exports = router;