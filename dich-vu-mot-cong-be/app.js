const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
const sequelize = require('./src/config/database');

// Test database connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Sync database
// sequelize.sync({ alter: true })
//     .then(() => {
//         console.log('Database synchronized');
//     })
//     .catch(err => {
//         console.error('Error synchronizing database:', err);
//     });

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const formTemplateRoutes = require('./src/routes/formTemplateRoutes');
const submittedFormRoutes = require('./src/routes/submittedFormRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const userRoutes = require('./src/routes/userRoutes');

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to One Stop Service API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/form-templates', formTemplateRoutes);
app.use('/api/submitted-forms', submittedFormRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 