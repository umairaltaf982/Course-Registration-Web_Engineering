const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { requireAdminLogin } = require('../middleware/sessionMiddleware');

  
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('prerequisites');
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

  
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('prerequisites');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

  
router.post('/', requireAdminLogin, async (req, res) => {
    try {
        const {
            code,
            name,
            department,
            level,
            creditHours,
            totalSeats,
            day,
            startTime,
            prerequisites,
            description
        } = req.body;
        
          
        const course = new Course({
            code,
            name,
            department,
            level: parseInt(level),
            creditHours: parseInt(creditHours),
            totalSeats: parseInt(totalSeats),
            seatsAvailable: parseInt(totalSeats),
            schedule: {
                day: parseInt(day),
                startTime: parseInt(startTime)
            },
            prerequisites: prerequisites || [],
            description
        });
        
        await course.save();
        
        if (req.headers['content-type'] === 'application/json') {
            return res.status(201).json(course);
        }
        
        res.redirect('/admin/manage-courses');
    } catch (error) {
        console.error(error);
        
        if (req.headers['content-type'] === 'application/json') {
            return res.status(500).json({ message: 'Server Error' });
        }
        
        res.render('admin/admin-add-course', {
            error: 'Error creating course',
            courses: await Course.find()
        });
    }
});

  
router.put('/:id', requireAdminLogin, async (req, res) => {
    try {
        const {
            code,
            name,
            department,
            level,
            creditHours,
            totalSeats,
            day,
            startTime,
            prerequisites,
            description
        } = req.body;
        
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
          
        const registeredSeats = course.totalSeats - course.seatsAvailable;
        const newTotalSeats = parseInt(totalSeats);
        const newSeatsAvailable = Math.max(0, newTotalSeats - registeredSeats);
        
          
        course.code = code;
        course.name = name;
        course.department = department;
        course.level = parseInt(level);
        course.creditHours = parseInt(creditHours);
        course.totalSeats = newTotalSeats;
        course.seatsAvailable = newSeatsAvailable;
        course.schedule.day = parseInt(day);
        course.schedule.startTime = parseInt(startTime);
        course.prerequisites = prerequisites || [];
        course.description = description;
        
        await course.save();
        
        if (req.headers['content-type'] === 'application/json') {
            return res.json(course);
        }
        
        res.redirect('/admin/manage-courses');
    } catch (error) {
        console.error(error);
        
        if (req.headers['content-type'] === 'application/json') {
            return res.status(500).json({ message: 'Server Error' });
        }
        
        res.render('admin/admin-edit-course', {
            error: 'Error updating course',
            course: await Course.findById(req.params.id),
            allCourses: await Course.find({ _id: { $ne: req.params.id } })
        });
    }
});

  
router.delete('/:id', requireAdminLogin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        await course.deleteOne();
        
        if (req.headers['content-type'] === 'application/json') {
            return res.json({ message: 'Course removed' });
        }
        
        res.redirect('/admin/manage-courses');
    } catch (error) {
        console.error(error);
        
        if (req.headers['content-type'] === 'application/json') {
            return res.status(500).json({ message: 'Server Error' });
        }
        
        res.redirect('/admin/manage-courses');
    }
});

module.exports = router;