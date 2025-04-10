const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');
const { requireAdminLogin } = require('../middleware/sessionMiddleware');

  
router.get('/', requireAdminLogin, async (req, res) => {
    try {
        const students = await Student.find().populate('courses completedCourses');
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

  
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

  
router.post('/', requireAdminLogin, async (req, res) => {
    try {
        const {
            rollNumber,
            name,
            email,
            department,
            semester
        } = req.body;
        
          
        let student = await Student.findOne({ rollNumber });
        
        if (student) {
            return res.status(400).json({ message: 'Student already exists' });
        }
        
          
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

  
router.post('/:id/add-course', requireAdminLogin, async (req, res) => {
    try {
        const { courseId } = req.body;
        
        const student = await Student.findById(req.params.id);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.status(404).json({ message: 'Student or course not found' });
        }
        
          
        if (student.courses.includes(courseId)) {
            return res.status(400).json({ message: 'Student already registered for this course' });
        }
        
          
        student.courses.push(courseId);
        await student.save();
        
          
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

  
  

  
router.post('/students/:id/remove-course', requireAdminLogin, async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.params.id;
        
          
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.redirect('/admin/manage-students?error=Student or course not found');
        }
        
          
        if (!student.courses.includes(courseId)) {
            return res.redirect(`/admin/student/${studentId}?error=Student not registered for this course`);
        }
        
          
        student.courses = student.courses.filter(id => id.toString() !== courseId.toString());
        await student.save();
        
          
        course.seatsAvailable += 1;
        await course.save();
        
        return res.redirect(`/admin/student/${studentId}?success=Course successfully removed from student's schedule`);
    } catch (error) {
        console.error('Error removing course:', error);
        return res.redirect('/admin/manage-students?error=Error removing course');
    }
});

module.exports = router;