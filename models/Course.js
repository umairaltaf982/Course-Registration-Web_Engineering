const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    seatsAvailable: { type: Number, required: true },
    prerequisites: [{ type: String }],
    schedule: {
        day: { type: Number, required: true }, // 0 = Monday, 4 = Friday
        startTime: { type: Number, required: true } // 8 = 8 AM, 17 = 5 PM
    }
});

module.exports = mongoose.model('Course', CourseSchema);
