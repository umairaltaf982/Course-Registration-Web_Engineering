const Student = require('../models/Student');
const Admin = require('../models/Admin');

exports.authenticateStudent = async (req, res, next) => {
    console.log('Student login attempt with roll:', req.body.rollNumber);
    const { rollNumber } = req.body;
    try {
        const student = await Student.findOne({ rollNumber }).populate('courses');
        if (!student) {
            return res.render('auth/student-login', { 
                error: 'Invalid roll number',
                rollNumber
            });
        }
        
        // Store student in session
        req.session.studentId = student._id;
        req.session.studentName = student.name;
        req.session.rollNumber = student.rollNumber;
        
        next();
    } catch (error) {
        console.error(error);
        res.status(500).render('auth/student-login', { 
            error: 'Server error. Please try again.',
            rollNumber
        });
    }
};

exports.authenticateAdmin = async (req, res, next) => {
    const { username, password } = req.body;
    
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.render('auth/admin-login', { 
                error: 'Invalid credentials',
                username 
            });
        }
        
        // In a production environment, you would use bcrypt to compare passwords
        const isMatch = password === admin.password;
        
        if (!isMatch) {
            return res.render('auth/admin-login', { 
                error: 'Invalid credentials',
                username 
            });
        }
        
        // Store admin in session
        req.session.adminId = admin._id;
        req.session.adminName = admin.name;
        req.session.adminUsername = admin.username;
        
        next();
    } catch (error) {
        console.error(error);
        res.status(500).render('auth/admin-login', { 
            error: 'Server error. Please try again.',
            username 
        });
    }
};