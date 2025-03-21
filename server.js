const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const methodOverride = require('method-override');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/students', require('./routes/student'));
app.use('/api/admins', require('./routes/admin'));
app.use('/api/courses', require('./routes/courses'));

// Render index page
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/auth/admin-login', (req, res) => {
    res.render('auth/admin-login');
});

// Global Error Handling Middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
