const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    seatsAvailable: { type: Number, required: true },
    prerequisites: [{ type: String }],
    schedule: {
        day: { type: Number, required: true },
        startTime: { type: Number, required: true }
    }
});

module.exports = mongoose.model('Course', CourseSchema);
