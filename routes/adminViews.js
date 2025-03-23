const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Student = require('../models/Student');
const { requireAdminLogin } = require('../middleware/sessionMiddleware');

// Admin Dashboard
router.get('/dashboard', requireAdminLogin, (req, res) => {
    res.render('admin/admin-dashboard');
});

// Manage Courses
router.get('/manage-courses', requireAdminLogin, async (req, res) => {
    try {
        const courses = await Course.find().populate('prerequisites');
        res.render('admin/admin-manage-courses', { courses, error: null, success: null });
    } catch (error) {
        console.error(error);
        res.render('admin/admin-manage-courses', { 
            courses: [], 
            error: 'Failed to load courses', 
            success: null 
        });
    }
});

// Add Course Form
router.get('/add-course', requireAdminLogin, async (req, res) => {
    try {
        const courses = await Course.find(); // For prerequisites selection
        res.render('admin/admin-add-course', { courses, error: null });
    } catch (error) {
        res.render('admin/admin-add-course', { 
            courses: [], 
            error: 'Failed to load courses for prerequisites' 
        });
    }
});

// Add Student Form
router.get('/add-student', requireAdminLogin, async (req, res) => {
    try {
        res.render('admin/admin-add-student', { 
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/manage-students?error=Error loading add student form');
    }
});

// Edit Course Form
router.get('/edit-course/:id', requireAdminLogin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('prerequisites');
        const allCourses = await Course.find({ _id: { $ne: req.params.id } });
        
        if (!course) {
            return res.redirect('/admin/manage-courses');
        }
        
        res.render('admin/admin-edit-course', { course, allCourses, error: null });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/manage-courses');
    }
});

// Manage Students
router.get('/manage-students', requireAdminLogin, async (req, res) => {
    try {
        const students = await Student.find().populate('courses');
        res.render('admin/admin-manage-students', { 
            students, 
            error: req.query.error || null, 
            success: req.query.success || null 
        });
    } catch (error) {
        console.error(error);
        res.render('admin/admin-manage-students', { 
            students: [], 
            error: 'Failed to load students', 
            success: null 
        });
    }
});


// View Student Details
router.get('/student/:id', requireAdminLogin, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('courses completedCourses');
        const availableCourses = await Course.find({
            _id: { $nin: student.courses }
        });
        
        if (!student) {
            return res.redirect('/admin/manage-students?error=Student not found');
        }
        
        res.render('admin/admin-student-detail', { 
            student, 
            availableCourses,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/manage-students?error=Error loading student details');
    }
});

// Edit Student Form
router.get('/edit-student/:id', requireAdminLogin, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.redirect('/admin/manage-students?error=Student not found');
        }
        
        res.render('admin/admin-edit-student', { 
            student,
            error: req.query.error || null
        });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/manage-students?error=Error loading student for editing');
    }
});

// Find the reports route and replace it with this:

// Admin Reports
router.get('/reports', requireAdminLogin, async (req, res) => {
    try {
        // Get all courses with student data
        const courses = await Course.find().lean();
        const students = await Student.find().populate('courses').lean();
        
        // Calculate registered students for each course
        const coursesWithStudents = courses.map(course => {
            // Find students enrolled in this course
            const registeredStudents = students.filter(student => 
                student.courses && student.courses.some(c => 
                    c && c._id && course._id && 
                    c._id.toString() === course._id.toString()
                )
            );
            
            return {
                ...course,
                registeredStudents: registeredStudents || [],
                registrationRate: course.totalSeats > 0 
                    ? ((course.totalSeats - course.seatsAvailable) / course.totalSeats * 100).toFixed(1) 
                    : 0
            };
        });
        
        // Department statistics
        const departmentStats = {};
        students.forEach(student => {
            const dept = student.department || 'Undeclared';
            
            if (!departmentStats[dept]) {
                departmentStats[dept] = {
                    name: dept,
                    totalStudents: 0,
                    courseEnrollments: 0
                };
            }
            
            departmentStats[dept].totalStudents++;
            departmentStats[dept].courseEnrollments += (student.courses || []).length;
        });
        
        res.render('admin/admin-reports', {
            courses: coursesWithStudents,
            students,
            departmentStats: Object.values(departmentStats),
            totalStudents: students.length,
            totalCourses: courses.length,
            totalEnrollments: students.reduce((sum, student) => 
                sum + ((student.courses || []).length), 0)
        });
        
    } catch (error) {
        console.error('Error generating reports:', error);
        res.status(500).render('error', {
            message: 'Error generating reports',
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
});

module.exports = router;