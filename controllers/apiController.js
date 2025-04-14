const Student = require('../models/Student');
const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('prerequisites');
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('prerequisites');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('courses');
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { name, rollNumber, email, department, semester } = req.body;
        
        if (!name || !rollNumber || !email || !department || !semester) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }
        
        const emailExists = await Student.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }
        
        const student = new Student({
            name,
            rollNumber,
            email,
            department,
            semester: parseInt(semester),
            courses: [],
            completedCourses: []
        });
        
        await student.save();
        
        res.status(201).json({ success: true, student });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { name, rollNumber, email, department, semester } = req.body;
        
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        if (rollNumber !== student.rollNumber) {
            const existingStudent = await Student.findOne({ rollNumber });
            if (existingStudent) {
                return res.status(400).json({ message: 'Roll number is already in use' });
            }
        }
        
        student.name = name;
        student.rollNumber = rollNumber;
        student.email = email;
        student.department = department;
        student.semester = parseInt(semester);
        
        await student.save();
        
        res.json({ success: true, student });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.removeStudentCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.session.studentId;
        
        if (!courseId) {
            return res.status(400).json({ 
                success: false,
                message: 'Course ID is required' 
            });
        }
        
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.status(404).json({ 
                success: false,
                message: 'Student or course not found' 
            });
        }
        
        if (!student.courses.includes(courseId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Course not in student schedule' 
            });
        }
        
        student.courses = student.courses.filter(id => 
            id.toString() !== courseId.toString()
        );
        await student.save();
        
        course.seatsAvailable += 1;
        await course.save();
        
        res.json({ 
            success: true,
            message: 'Course removed successfully' 
        });
    } catch (error) {
        console.error('Error removing course:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error occurred' 
        });
    }
};

exports.adminRemoveStudentCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.params.id;
        
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.redirect('/admin/manage-students?error=Student or course not found');
        }
        
        if (!student.courses.includes(courseId)) {
            return res.redirect(`/admin/student/${studentId}?error=Student not registered for this course`);
        }
        
        student.courses = student.courses.filter(id => id.toString() !== courseId.toString());
        await student.save();
        
        course.seatsAvailable += 1;
        await course.save();
        
        return res.redirect(`/admin/student/${studentId}?success=Course successfully removed from student's schedule`);
    } catch (error) {
        console.error('Error removing course:', error);
        return res.redirect('/admin/manage-students?error=Error removing course');
    }
};

exports.adminAddStudentCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.params.id;
        
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);
        
        if (!student || !course) {
            return res.redirect('/admin/manage-students?error=Student or course not found');
        }
        
        if (student.courses.includes(courseId)) {
            return res.redirect(`/admin/student/${studentId}?error=Student already registered for this course`);
        }
        
        if (course.seatsAvailable <= 0) {
            return res.redirect(`/admin/student/${studentId}?error=No seats available for this course`);
        }
        
        student.courses.push(courseId);
        await student.save();
        
        course.seatsAvailable -= 1;
        await course.save();
        
        return res.redirect(`/admin/student/${studentId}?success=Course successfully added to student's schedule`);
    } catch (error) {
        console.error('Error adding course:', error);
        return res.redirect('/admin/manage-students?error=Error adding course');
    }
};
