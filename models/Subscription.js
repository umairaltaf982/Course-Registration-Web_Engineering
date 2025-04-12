const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    notified: {
        type: Boolean,
        default: false
    }
});

// Compound index to ensure a student can only subscribe once to a course
SubscriptionSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
