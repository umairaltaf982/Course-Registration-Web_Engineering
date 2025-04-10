const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { requireAdminLogin } = require('../middleware/sessionMiddleware');
const bcrypt = require('bcryptjs');

  
router.get('/', requireAdminLogin, async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

  
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email } = req.body;
        
          
        let admin = await Admin.findOne({ username });
        
        if (admin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        
          
        admin = new Admin({
            username,
            password,   
            name,
            email
        });
        
          
          
          
        
        await admin.save();
        
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;