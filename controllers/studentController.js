const Student = require('../models/Student');
const Course = require('../models/Course');

// Student Login
exports.loginStudent = async (req, res) => {
    const { rollNumber } = req.body;
    try {
        const student = await Student.findOne({ rollNumber }).populate('courses');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Login successful', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Available Courses
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Register for a Course
exports.registerCourse = async (req, res) => {
    const { rollNumber, courseId } = req.body;
    try {
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.seatsAvailable <= 0) {
            return res.status(400).json({ message: 'No available seats' });
        }

        // Add course to student
        student.courses.push(courseId);
        course.seatsAvailable -= 1;
        await student.save();
        await course.save();

        res.json({ message: 'Course registered successfully', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getStudentSchedule = async (req, res) => {
    try {
        const student = await Student.findOne({ rollNumber: req.query.rollNumber }).populate('courses');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.render('student/student-schedule', { student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
