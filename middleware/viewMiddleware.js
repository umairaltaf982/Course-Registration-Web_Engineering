const Student = require('../models/Student');

exports.addUserToViews = async (req, res, next) => {
    res.locals.user = null;

    if (req.session && req.session.studentId) {
        // Get the student to check for unread notifications
        try {
            const student = await Student.findById(req.session.studentId);

            res.locals.user = {
                id: req.session.studentId,
                name: req.session.studentName,
                rollNumber: req.session.rollNumber,
                role: 'student',
                hasUnreadNotifications: student ? student.hasUnreadNotifications : false
            };
        } catch (error) {
            console.error('Error fetching student data for navbar:', error);

            // Fallback if there's an error
            res.locals.user = {
                id: req.session.studentId,
                name: req.session.studentName,
                rollNumber: req.session.rollNumber,
                role: 'student',
                hasUnreadNotifications: false
            };
        }
    }

    else if (req.session && req.session.adminId) {
        res.locals.user = {
            id: req.session.adminId,
            name: req.session.adminName,
            username: req.session.adminUsername,
            role: 'admin'
        };
    }

    next();
};