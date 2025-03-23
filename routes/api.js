const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');
const { requireAdminLogin, requireStudentLogin } = require('../middleware/sessionMiddleware');

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find().populate('prerequisites');
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get specific course
router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('prerequisites');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all students
router.get('/students', requireAdminLogin, async (req, res) => {
    try {
        const students = await Student.find().populate('courses');
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add this handler if it's not already present:

// Create new student
router.post('/students', requireAdminLogin, async (req, res) => {
    try {
        const { name, rollNumber, email, department, semester } = req.body;
        
        // Validate required fields
        if (!name || !rollNumber || !email || !department || !semester) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if roll number already exists
        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }
        
        // Check if email already exists
        const emailExists = await Student.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }
        
        // Create new student
        const student = new Student({
            name,
            rollNumber,
            email,
            department,
            semester: parseInt(semester),
            courses: [],
            completedCourses: []
        });
        
        await student.save();
        
        res.status(201).json({ success: true, student });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update student information
router.put('/students/:id', requireAdminLogin, async (req, res) => {
    try {
        const { name, rollNumber, email, department, semester } = req.body;
        
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        // Check if roll number is already in use by another student
        if (rollNumber !== student.rollNumber) {
            const existingStudent = await Student.findOne({ rollNumber });
            if (existingStudent) {
                return res.status(400).json({ message: 'Roll number is already in use' });
            }
        }
        
        // Update student information
        student.name = name;
        student.rollNumber = rollNumber;
        student.email = email;
        student.department = department;
        student.semester = parseInt(semester);
        
        await student.save();
        
        res.json({ success: true, student });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Remove course from student's schedule (for logged-in student)
router.post('/students/remove-course', requireStudentLogin, async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.session.studentId;
        
        if (!courseId) {
            return res.status(400).json({ 
                success: false,
                message: 'Course ID is required' 
            });
        }
        
        // Get the student and course
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.status(404).json({ 
                success: false,
                message: 'Student or course not found' 
            });
        }
        
        // Check if course is in student's schedule
        if (!student.courses.includes(courseId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Course not in student schedule' 
            });
        }
        
        // Remove the course from student's schedule
        student.courses = student.courses.filter(id => 
            id.toString() !== courseId.toString()
        );
        await student.save();
        
        // Update course availability
        course.seatsAvailable += 1;
        await course.save();
        
        res.json({ 
            success: true,
            message: 'Course removed successfully' 
        });
    } catch (error) {
        console.error('Error removing course:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error occurred' 
        });
    }
});

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

// Add course to student (admin only)
router.post('/students/:id/add-course', requireAdminLogin, async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.params.id;
        
        // Find student and course
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.redirect('/admin/manage-students?error=Student or course not found');
        }
        
        // Check if student already registered for this course
        if (student.courses.includes(courseId)) {
            return res.redirect(`/admin/student/${studentId}?error=Student already registered for this course`);
        }
        
        // Check if seats available
        if (course.seatsAvailable <= 0) {
            return res.redirect(`/admin/student/${studentId}?error=No seats available for this course`);
        }
        
        // Add course to student
        student.courses.push(courseId);
        await student.save();
        
        // Update course seat availability
        course.seatsAvailable -= 1;
        await course.save();
        
        return res.redirect(`/admin/student/${studentId}?success=Course successfully added to student's schedule`);
    } catch (error) {
        console.error('Error adding course:', error);
        return res.redirect('/admin/manage-students?error=Error adding course');
    }
});

module.exports = router;