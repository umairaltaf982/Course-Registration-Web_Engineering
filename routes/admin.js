const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { requireAdminLogin } = require('../middleware/sessionMiddleware');
const bcrypt = require('bcryptjs');

// Get all admins (admin only)
router.get('/', requireAdminLogin, async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Register admin (for initial setup)
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email } = req.body;
        
        // Check if admin already exists
        let admin = await Admin.findOne({ username });
        
        if (admin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        
        // Create new admin
        admin = new Admin({
            username,
            password, // In production, hash this password with bcrypt
            name,
            email
        });
        
        // In production, hash password
        // const salt = await bcrypt.genSalt(10);
        // admin.password = await bcrypt.hash(password, salt);
        
        await admin.save();
        
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;