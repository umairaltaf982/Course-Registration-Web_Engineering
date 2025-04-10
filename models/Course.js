const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    creditHours: {
        type: Number,
        required: true
    },
    totalSeats: {
        type: Number,
        required: true
    },
    seatsAvailable: {
        type: Number,
        required: true
    },
    schedule: {
        day: {
            type: Number,
            required: true
        },
        startTime: {
            type: Number,
            required: true
        }
    },
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    description: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Course', CourseSchema);