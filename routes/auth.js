const express = require('express');
const router = express.Router();
const { authenticateStudent, authenticateAdmin } = require('../middleware/authMiddleware');

// Student Login Page
router.get('/student-login', (req, res) => {
    res.render('auth/student-login', { error: null, rollNumber: '' });
});

// Student Login Submit
router.post('/student-login', authenticateStudent, (req, res) => {
    res.redirect('/student/dashboard');
});

// Admin Login Page
router.get('/admin-login', (req, res) => {
    res.render('auth/admin-login', { error: null, username: '' });
});

// Admin Login Submit
router.post('/admin-login', authenticateAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;