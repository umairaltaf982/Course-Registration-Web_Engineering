const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const methodOverride = require('method-override');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/students', require('./routes/student'));
app.use('/api/admins', require('./routes/admin'));
app.use('/api/courses', require('./routes/courses'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/auth/admin-login', (req, res) => {
    res.render('auth/admin-login');
});

app.get('/admin/manage-courses', (req, res) => {
    res.render('admin/admin-manage-courses');
});

app.get('/auth/student-login', (req, res) => {
    res.render('auth/student-login');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
