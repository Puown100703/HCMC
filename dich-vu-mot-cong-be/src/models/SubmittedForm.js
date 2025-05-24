const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubmittedForm = sequelize.define('SubmittedForm', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'form_templates',
            key: 'id'
        }
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    html_content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    assigned_staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'submittedforms',
    timestamps: true,
    createdAt: 'submitted_at',
    updatedAt: 'updated_at'
});

module.exports = SubmittedForm; 