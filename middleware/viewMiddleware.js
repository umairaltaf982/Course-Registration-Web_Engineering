exports.addUserToViews = (req, res, next) => {
    res.locals.user = null;
    
    if (req.session && req.session.studentId) {
        res.locals.user = {
            id: req.session.studentId,
            name: req.session.studentName,
            rollNumber: req.session.rollNumber,
            role: 'student'
        };
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