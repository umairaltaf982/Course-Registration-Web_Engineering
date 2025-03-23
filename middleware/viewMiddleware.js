/**
 * Middleware to add user info to views based on session data
 */
exports.addUserToViews = (req, res, next) => {
    // Set default user to null (not logged in)
    res.locals.user = null;
    
    // If student is logged in
    if (req.session && req.session.studentId) {
        res.locals.user = {
            id: req.session.studentId,
            name: req.session.studentName,
            rollNumber: req.session.rollNumber,
            role: 'student'
        };
    }
    
    // If admin is logged in
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