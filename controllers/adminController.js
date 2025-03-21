const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Student = require('../models/Student');

const Admin = require('../models/Admin');

// Admin Login
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        // Compare hashed password
        const isMatch = await Admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        res.json({ message: 'Admin login successful', admin });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Add Course
exports.addCourse = async (req, res) => {
    const { name, code, seatsAvailable, prerequisites } = req.body;
    try {
        const newCourse = new Course({ name, code, seatsAvailable, prerequisites });
        await newCourse.save();
        res.json({ message: 'Course added successfully', newCourse });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get All Students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('courses');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
