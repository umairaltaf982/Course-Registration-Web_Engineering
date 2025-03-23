const session = require('express-session');

exports.setupSession = (app) => {
    app.use(session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));
};

exports.requireStudentLogin = (req, res, next) => {
    if (req.session && req.session.studentId) {
        return next();
    }
    
    if (req.headers['content-type'] === 'application/json') {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    res.redirect('/auth/student-login');
};

exports.requireAdminLogin = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return next();
    }
    
    if (req.headers['content-type'] === 'application/json') {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    res.redirect('/auth/admin-login');
};