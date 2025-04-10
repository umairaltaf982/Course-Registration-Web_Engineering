const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Course = require('./models/Course');

  
dotenv.config();

  
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected for seeding');
    seedDatabase();
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

  
async function seedDatabase() {
    try {
          
        await Admin.deleteMany({});
        await Student.deleteMany({});
        await Course.deleteMany({});
        
        console.log('Cleared existing data');

          
        const admins = await Admin.create([
            {
                username: 'admin',
                password: 'password',    
                name: 'Administrator',
                email: 'admin@university.edu'
            },
            {
                username: 'registrar',
                password: 'registrar123',
                name: 'Course Registrar',
                email: 'registrar@university.edu'
            }
        ]);
        
        console.log('Created admin users:', admins.map(admin => admin.username));

          
        const coursesData = [
            {
                code: 'CS101',
                name: 'Introduction to Computer Science',
                department: 'Computer Science',
                level: 100,
                creditHours: 3,
                totalSeats: 50,
                seatsAvailable: 50,
                schedule: { day: 0, startTime: 9 },
                description: 'Fundamentals of computer science and programming'
            },
            {
                code: 'CS201',
                name: 'Data Structures',
                department: 'Computer Science',
                level: 200,
                creditHours: 3,
                totalSeats: 40,
                seatsAvailable: 40,
                schedule: { day: 1, startTime: 11 },
                description: 'Implementation and analysis of data structures'
            },
            {
                code: 'CS301',
                name: 'Database Systems',
                department: 'Computer Science',
                level: 300,
                creditHours: 3,
                totalSeats: 35,
                seatsAvailable: 35,
                schedule: { day: 2, startTime: 14 },
                description: 'Principles of database design and management'
            },
            {
                code: 'ENG101',
                name: 'English Composition',
                department: 'English',
                level: 100,
                creditHours: 3,
                totalSeats: 60,
                seatsAvailable: 60,
                schedule: { day: 3, startTime: 10 },
                description: 'Fundamentals of academic writing'
            },
            {
                code: 'MATH201',
                name: 'Calculus I',
                department: 'Mathematics',
                level: 200,
                creditHours: 4,
                totalSeats: 45,
                seatsAvailable: 45,
                schedule: { day: 4, startTime: 8 },
                description: 'Introduction to differential and integral calculus'
            },
            {
                code: 'MATH301',
                name: 'Linear Algebra',
                department: 'Mathematics',
                level: 300,
                creditHours: 3,
                totalSeats: 30,
                seatsAvailable: 30,
                schedule: { day: 0, startTime: 13 },
                description: 'Vector spaces, linear transformations, and matrices'
            },
            {
                code: 'PHYS101',
                name: 'Physics I',
                department: 'Physics',
                level: 100,
                creditHours: 4,
                totalSeats: 40,
                seatsAvailable: 40,
                schedule: { day: 1, startTime: 9 },
                description: 'Mechanics, thermodynamics, and waves'
            },
            {
                code: 'CS401',
                name: 'Software Engineering',
                department: 'Computer Science',
                level: 400,
                creditHours: 3,
                totalSeats: 25,
                seatsAvailable: 25,
                schedule: { day: 2, startTime: 10 },
                description: 'Principles and practices of software development'
            }
        ];

        const courses = await Course.create(coursesData);
        console.log('Created courses:', courses.map(course => course.code));

          
        const cs201 = courses.find(c => c.code === 'CS201');
        const cs101 = courses.find(c => c.code === 'CS101');
        const cs301 = courses.find(c => c.code === 'CS301');
        const cs401 = courses.find(c => c.code === 'CS401');
        const math301 = courses.find(c => c.code === 'MATH301');
        const math201 = courses.find(c => c.code === 'MATH201');

          
        cs201.prerequisites = [cs101._id];
        await cs201.save();

          
        cs301.prerequisites = [cs201._id];
        await cs301.save();

          
        cs401.prerequisites = [cs301._id];
        await cs401.save();

          
        math301.prerequisites = [math201._id];
        await math301.save();

        console.log('Set up course prerequisites');

          
        const students = await Student.create([
            {
                rollNumber: 'F19-101',
                name: 'John Smith',
                email: 'john.smith@university.edu',
                department: 'Computer Science',
                semester: 3,
                courses: [cs101._id],
                completedCourses: []
            },
            {
                rollNumber: 'F19-102',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@university.edu',
                department: 'Computer Science',
                semester: 3,
                courses: [cs101._id, math201._id],
                completedCourses: []
            },
            {
                rollNumber: 'F19-103',
                name: 'Michael Brown',
                email: 'michael.brown@university.edu',
                department: 'Mathematics',
                semester: 5,
                courses: [math201._id],
                completedCourses: [math201._id]
            },
            {
                rollNumber: 'F20-104',
                name: 'Emily Davis',
                email: 'emily.davis@university.edu',
                department: 'English',
                semester: 1,
                courses: [],
                completedCourses: []
            },
            {
                rollNumber: 'F20-105',
                name: 'David Wilson',
                email: 'david.wilson@university.edu',
                department: 'Physics',
                semester: 4,
                courses: [],
                completedCourses: []
            }
        ]);

        console.log('Created students:', students.map(student => student.rollNumber));

          
        for (const student of students) {
            for (const courseId of student.courses) {
                const course = await Course.findById(courseId);
                course.seatsAvailable -= 1;
                await course.save();
            }
        }

        console.log('Updated seat availability');
        console.log('Database seeding completed successfully!');
        
    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
}