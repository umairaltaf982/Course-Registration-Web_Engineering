const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Course Routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);

module.exports = router;
