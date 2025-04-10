const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Course = require('../models/Course');
const { requireStudentLogin } = require('../middleware/sessionMiddleware');

  
router.get('/dashboard', requireStudentLogin, async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId)
            .populate('courses completedCourses');
        
        res.render('student/student-dashboard', { student });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

  
router.get('/schedule', requireStudentLogin, async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId)
            .populate('courses');
        
        res.render('student/student-schedule', { student });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

  
router.get('/courses', requireStudentLogin, async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId);
        
          
        const courses = await Course.find({
            _id: { $nin: student.courses }
        }).populate('prerequisites');
        
          
        const departments = await Course.distinct('department');
        
        res.render('student/student-courses', { 
            courses, 
            departments,
            temporarySchedule: req.session.temporarySchedule || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

  
router.post('/add-to-temp', requireStudentLogin, async (req, res) => {
    try {
        const { courseId } = req.body;
        
          
        if (!req.session.temporarySchedule) {
            req.session.temporarySchedule = [];
        }
        
          
        if (!req.session.temporarySchedule.includes(courseId)) {
            req.session.temporarySchedule.push(courseId);
        }
        
        res.json({ success: true, temporarySchedule: req.session.temporarySchedule });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

  
router.post('/remove-from-temp', requireStudentLogin, (req, res) => {
    try {
        const { courseId, clearAll } = req.body;
        
        if (clearAll) {
            req.session.temporarySchedule = [];
        } else if (courseId && req.session.temporarySchedule) {
            req.session.temporarySchedule = req.session.temporarySchedule.filter(id => id !== courseId);
        }
        
        res.json({ success: true, temporarySchedule: req.session.temporarySchedule || [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

  
router.get('/temp-schedule', requireStudentLogin, async (req, res) => {
    try {
        if (!req.session.temporarySchedule || req.session.temporarySchedule.length === 0) {
            return res.json({ courses: [] });
        }
        
        const courses = await Course.find({ _id: { $in: req.session.temporarySchedule } });
        res.json({ courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

  
router.post('/register', requireStudentLogin, async (req, res) => {
    try {
        if (!req.session.temporarySchedule || req.session.temporarySchedule.length === 0) {
            return res.json({ success: false, message: 'No courses selected' });
        }
        
        const student = await Student.findById(req.session.studentId);
        const completedCourseIds = student.completedCourses.map(course => course.toString());
        
          
        const tempCourses = await Course.find({ _id: { $in: req.session.temporarySchedule } }).populate('prerequisites');
        const existingCourses = await Course.find({ _id: { $in: student.courses } });
        const allCourses = [...tempCourses, ...existingCourses];
        
        const timeSlots = {};
        let conflicts = [];
        const missingPrerequisites = [];

        for (const course of tempCourses) {
            if (course.prerequisites && course.prerequisites.length > 0) {
                for (const prereq of course.prerequisites) {
                    if (!completedCourseIds.includes(prereq._id.toString())) {
                        missingPrerequisites.push({
                            course: course.name,
                            prerequisite: prereq.name
                        });
                    }
                }
            }
        }

        if (missingPrerequisites.length > 0) {
            return res.json({
                success: false,
                message: 'Missing prerequisites required for some courses',
                missingPrerequisites
            });
        }

        allCourses.forEach(course => {
            const key = `${course.schedule.day}-${course.schedule.startTime}`;
            if (timeSlots[key]) {
                conflicts.push({
                    course1: timeSlots[key].name,
                    course2: course.name
                });
            } else {
                timeSlots[key] = course;
            }
        });
        
        if (conflicts.length > 0) {
            return res.json({ 
                success: false, 
                message: 'Schedule has time conflicts. Please resolve before continuing.',
                conflicts
            });
        }
        
          
        for (const courseId of req.session.temporarySchedule) {
            const course = await Course.findById(courseId);
            if (course.seatsAvailable <= 0) {
                return res.json({ 
                    success: false, 
                    message: `${course.name} (${course.code}) has no available seats.`
                });
            }
            
              
            course.seatsAvailable -= 1;
            await course.save();
        }
        
          
        student.courses = [...student.courses, ...req.session.temporarySchedule];
        await student.save();
        
          
        req.session.temporarySchedule = [];
        
        res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

  
router.post('/save-schedule', requireStudentLogin, async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId);
        
          
          
        
        res.json({ success: true, message: 'Schedule saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

  
router.get('/api/courses/departments', async (req, res) => {
    try {
        const departments = await Course.distinct('department');
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;