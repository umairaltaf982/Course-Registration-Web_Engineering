const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const methodOverride = require('method-override');
const { errorHandler } = require('./middleware/errorMiddleware');
const { setupSession } = require('./middleware/sessionMiddleware');
const { addUserToViews } = require('./middleware/viewMiddleware');
const cors = require('cors');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Setup session
setupSession(app);

// Add user data to views - THIS IS THE IMPORTANT ADDITION
app.use(addUserToViews);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/courses', require('./routes/courses'));
app.use('/api/students', require('./routes/student'));
app.use('/api/admins', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/adminViews'));
app.use('/student', require('./routes/studentViews'));
app.use('/api', require('./routes/api'));

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// Catch-all for 404s
app.use((req, res, next) => {
    res.status(404);
    
    // Respond with html page
    if (req.accepts('html')) {
        return res.render('error', { 
            message: 'Page not found',
            stack: null
        });
    }
    
    // Respond with json
    if (req.accepts('json')) {
        return res.json({ error: 'Not found' });
    }
    
    // Default to plain text
    res.type('txt').send('Not found');
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));