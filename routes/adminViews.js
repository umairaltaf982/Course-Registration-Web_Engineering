const express = require('express');
const router = express.Router();
const { requireAdminLogin } = require('../middleware/sessionMiddleware');
const adminViewsController = require('../controllers/adminViewsController');


router.get('/dashboard', requireAdminLogin, adminViewsController.getDashboard);


router.get('/manage-courses', requireAdminLogin, adminViewsController.getManageCourses);


router.get('/add-course', requireAdminLogin, adminViewsController.getAddCourse);


router.get('/add-student', requireAdminLogin, adminViewsController.getAddStudent);


router.get('/edit-course/:id', requireAdminLogin, adminViewsController.getEditCourse);


router.get('/manage-students', requireAdminLogin, adminViewsController.getManageStudents);


router.get('/student/:id', requireAdminLogin, adminViewsController.getStudentDetail);


router.get('/edit-student/:id', requireAdminLogin, adminViewsController.getEditStudent);


router.get('/reports', requireAdminLogin, adminViewsController.getReports);

module.exports = router;