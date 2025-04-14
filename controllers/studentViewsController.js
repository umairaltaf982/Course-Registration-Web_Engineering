const Student = require('../models/Student');
const Course = require('../models/Course');
const Subscription = require('../models/Subscription');

exports.getDashboard = async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId)
            .populate('courses completedCourses');

        res.render('student/student-dashboard', { student });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getSchedule = async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId)
            .populate('courses');

        res.render('student/student-schedule', { student });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getCourses = async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId);

        const courses = await Course.find({
            _id: { $nin: student.courses }
        }).populate('prerequisites');

        const departments = await Course.distinct('department');

        res.render('student/student-courses', {
            courses,
            departments,
            temporarySchedule: req.session.temporarySchedule || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.addToTemp = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!req.session.temporarySchedule) {
            req.session.temporarySchedule = [];
        }

        if (!req.session.temporarySchedule.includes(courseId)) {
            req.session.temporarySchedule.push(courseId);
        }

        res.json({ success: true, temporarySchedule: req.session.temporarySchedule });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.removeFromTemp = (req, res) => {
    try {
        const { courseId, clearAll } = req.body;

        if (clearAll) {
            req.session.temporarySchedule = [];
        } else if (courseId && req.session.temporarySchedule) {
            req.session.temporarySchedule = req.session.temporarySchedule.filter(id => id !== courseId);
        }

        res.json({ success: true, temporarySchedule: req.session.temporarySchedule || [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getTempSchedule = async (req, res) => {
    try {
        if (!req.session.temporarySchedule || req.session.temporarySchedule.length === 0) {
            return res.json({ courses: [] });
        }

        const courses = await Course.find({ _id: { $in: req.session.temporarySchedule } });
        res.json({ courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.register = async (req, res) => {
    try {
        if (!req.session.temporarySchedule || req.session.temporarySchedule.length === 0) {
            return res.json({ success: false, message: 'No courses selected' });
        }

        const student = await Student.findById(req.session.studentId);
        const completedCourseIds = student.completedCourses.map(course => course.toString());

        const tempCourses = await Course.find({ _id: { $in: req.session.temporarySchedule } }).populate('prerequisites');
        const existingCourses = await Course.find({ _id: { $in: student.courses } });
        const allCourses = [...tempCourses, ...existingCourses];

        const timeSlots = {};
        let conflicts = [];
        const missingPrerequisites = [];

        for (const course of tempCourses) {
            if (course.prerequisites && course.prerequisites.length > 0) {
                for (const prereq of course.prerequisites) {
                    if (!completedCourseIds.includes(prereq._id.toString())) {
                        missingPrerequisites.push({
                            course: course.name,
                            prerequisite: prereq.name
                        });
                    }
                }
            }
        }

        if (missingPrerequisites.length > 0) {
            return res.json({
                success: false,
                message: 'Missing prerequisites required for some courses',
                missingPrerequisites
            });
        }

        allCourses.forEach(course => {
            const key = `${course.schedule.day}-${course.schedule.startTime}`;
            if (timeSlots[key]) {
                conflicts.push({
                    course1: timeSlots[key].name,
                    course2: course.name
                });
            } else {
                timeSlots[key] = course;
            }
        });

        if (conflicts.length > 0) {
            return res.json({
                success: false,
                message: 'Schedule has time conflicts. Please resolve before continuing.',
                conflicts
            });
        }

        for (const courseId of req.session.temporarySchedule) {
            const course = await Course.findById(courseId);
            if (course.seatsAvailable <= 0) {
                return res.json({
                    success: false,
                    message: `${course.name} (${course.code}) has no available seats.`
                });
            }

            course.seatsAvailable -= 1;
            await course.save();
        }

        student.courses = [...student.courses, ...req.session.temporarySchedule];
        await student.save();

        req.session.temporarySchedule = [];

        res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.saveSchedule = async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId);
        res.json({ success: true, message: 'Schedule saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getCourseDepartments = async (req, res) => {
    try {
        const departments = await Course.distinct('department');
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId)
            .populate({
                path: 'subscriptions',
                populate: {
                    path: 'course',
                    model: 'Course'
                }
            });

        if (student.hasUnreadNotifications) {
            student.hasUnreadNotifications = false;
            await student.save();
        }

        res.render('student/student-notifications', {
            student,
            subscriptions: student.subscriptions || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.subscribe = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.session.studentId;

        const existingSubscription = await Subscription.findOne({
            student: studentId,
            course: courseId
        });

        if (existingSubscription) {
            return res.json({
                success: false,
                message: 'You are already subscribed to this course'
            });
        }

        const subscription = new Subscription({
            student: studentId,
            course: courseId
        });

        await subscription.save();

        const student = await Student.findById(studentId);
        student.subscriptions.push(subscription._id);
        await student.save();

        res.json({
            success: true,
            message: 'Successfully subscribed to course'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.unsubscribe = async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        const studentId = req.session.studentId;

        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.student.toString() !== studentId) {
            return res.json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const student = await Student.findById(studentId);
        student.subscriptions = student.subscriptions.filter(
            sub => sub.toString() !== subscriptionId
        );
        await student.save();

        await Subscription.findByIdAndDelete(subscriptionId);

        res.json({
            success: true,
            message: 'Successfully unsubscribed from course'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
