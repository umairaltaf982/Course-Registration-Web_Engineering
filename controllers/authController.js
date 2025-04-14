const Student = require('../models/Student');
const Admin = require('../models/Admin');

exports.getStudentLogin = (req, res) => {
    res.render('auth/student-login', { error: null, rollNumber: '' });
};

exports.postStudentLogin = (req, res) => {
    res.redirect('/student/dashboard');
};

exports.getAdminLogin = (req, res) => {
    res.render('auth/admin-login', { error: null, username: '' });
};

exports.postAdminLogin = (req, res) => {
    res.redirect('/admin/dashboard');
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
};
