const Student = require('../models/Student');
const Admin = require('../models/Admin');

exports.authenticateStudent = async (req, res, next) => {
    const { rollNumber } = req.body;
    try {
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(401).json({ message: 'Unauthorized: Invalid student roll number' });
        }
        req.student = student;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.authenticateAdmin = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username, password });
        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized: Invalid admin credentials' });
        }
        req.admin = admin;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
