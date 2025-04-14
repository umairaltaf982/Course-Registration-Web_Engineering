const Student = require('../models/Student');
const Course = require('../models/Course');
const Subscription = require('../models/Subscription');

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

exports.checkAndNotifyStudents = async (courseId) => {
    try {
        const course = await Course.findById(courseId);

        if (!course || course.seatsAvailable <= 0) {
            return;
        }

        const subscriptions = await Subscription.find({
            course: courseId,
            notified: false
        }).populate('student');

        for (const subscription of subscriptions) {
            const student = subscription.student;

            if (student) {
                student.hasUnreadNotifications = true;
                await student.save();

                subscription.notified = true;
                await subscription.save();
            }
        }
    } catch (error) {
        console.error('Error notifying students:', error);
    }
};
