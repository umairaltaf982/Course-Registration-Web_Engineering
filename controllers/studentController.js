const Student = require('../models/Student');
const Course = require('../models/Course');

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('courses completedCourses');
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('courses completedCourses');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const {
            rollNumber,
            name,
            email,
            department,
            semester
        } = req.body;

        let student = await Student.findOne({ rollNumber });

        if (student) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        student = new Student({
            rollNumber,
            name,
            email,
            department,
            semester: parseInt(semester),
            courses: [],
            completedCourses: []
        });

        await student.save();

        res.status(201).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const {
            rollNumber,
            name,
            email,
            department,
            semester
        } = req.body;

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.rollNumber = rollNumber;
        student.name = name;
        student.email = email;
        student.department = department;
        student.semester = parseInt(semester);

        await student.save();

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addCourseToStudent = async (req, res) => {
    try {
        const { courseId } = req.body;

        const student = await Student.findById(req.params.id);
        const course = await Course.findById(courseId);

        if (!student || !course) {
            return res.status(404).json({ message: 'Student or course not found' });
        }

        if (student.courses.includes(courseId)) {
            return res.status(400).json({ message: 'Student already registered for this course' });
        }

        student.courses.push(courseId);
        await student.save();

        if (course.seatsAvailable > 0) {
            course.seatsAvailable -= 1;
            await course.save();
        }

        res.json({ message: 'Course added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.removeCourseFromStudent = async (req, res) => {
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

exports.loginStudent = async (req, res) => {
    const { rollNumber } = req.body;
    try {
        const student = await Student.findOne({ rollNumber }).populate('courses');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.render('student/student-dashboard',{
            student:student
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.registerCourse = async (req, res) => {
    const { rollNumber, courseId } = req.body;
    try {
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.seatsAvailable <= 0) {
            return res.status(400).json({ message: 'No available seats' });
        }

        student.courses.push(courseId);
        course.seatsAvailable -= 1;
        await student.save();
        await course.save();

        res.json({ message: 'Course registered successfully', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.getStudentSchedule = async (req, res) => {
    try {
        const student = await Student.findOne({ rollNumber: req.query.rollNumber }).populate('courses');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.render('student/student-schedule', { student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.renderStudentCourses = async(req, res) => {
    try {
        const courses = await Course.find({});
        const student = await Student.findOne({ rollNumber: req.query.rollNumber }).populate('courses');
        res.render('student/student-courses', {
            courses:courses,
            student:student
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};