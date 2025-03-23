const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');
const { requireAdminLogin } = require('../middleware/sessionMiddleware');

// Get all students (admin only)
router.get('/', requireAdminLogin, async (req, res) => {
    try {
        const students = await Student.find().populate('courses completedCourses');
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get student by ID (admin only)
router.get('/:id', requireAdminLogin, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('courses completedCourses');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add student (admin only)
router.post('/', requireAdminLogin, async (req, res) => {
    try {
        const {
            rollNumber,
            name,
            email,
            department,
            semester
        } = req.body;
        
        // Check if student already exists
        let student = await Student.findOne({ rollNumber });
        
        if (student) {
            return res.status(400).json({ message: 'Student already exists' });
        }
        
        // Create new student
        student = new Student({
            rollNumber,
            name,
            email,
            department,
            semester: parseInt(semester),
            courses: [],
            completedCourses: []
        });
        
        await student.save();
        
        res.status(201).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update student (admin only)
router.put('/:id', requireAdminLogin, async (req, res) => {
    try {
        const {
            rollNumber,
            name,
            email,
            department,
            semester
        } = req.body;
        
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Update student
        student.rollNumber = rollNumber;
        student.name = name;
        student.email = email;
        student.department = department;
        student.semester = parseInt(semester);
        
        await student.save();
        
        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add course to student (admin override)
router.post('/:id/add-course', requireAdminLogin, async (req, res) => {
    try {
        const { courseId } = req.body;
        
        const student = await Student.findById(req.params.id);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.status(404).json({ message: 'Student or course not found' });
        }
        
        // Check if student already registered for this course
        if (student.courses.includes(courseId)) {
            return res.status(400).json({ message: 'Student already registered for this course' });
        }
        
        // Add course to student
        student.courses.push(courseId);
        await student.save();
        
        // Update seat availability
        if (course.seatsAvailable > 0) {
            course.seatsAvailable -= 1;
            await course.save();
        }
        
        res.json({ message: 'Course added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Remove course from student
// Add this route handler if it doesn't exist yet

// Remove course from student (admin only)
router.post('/students/:id/remove-course', requireAdminLogin, async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.params.id;
        
        // Find student and course
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.redirect('/admin/manage-students?error=Student or course not found');
        }
        
        // Check if course is in student's list
        if (!student.courses.includes(courseId)) {
            return res.redirect(`/admin/student/${studentId}?error=Student not registered for this course`);
        }
        
        // Remove course from student
        student.courses = student.courses.filter(id => id.toString() !== courseId.toString());
        await student.save();
        
        // Update course seat availability
        course.seatsAvailable += 1;
        await course.save();
        
        return res.redirect(`/admin/student/${studentId}?success=Course successfully removed from student's schedule`);
    } catch (error) {
        console.error('Error removing course:', error);
        return res.redirect('/admin/manage-students?error=Error removing course');
    }
});

module.exports = router;