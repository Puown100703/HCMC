const Department = require('./Department');
const User = require('./User');
const FormTemplate = require('./FormTemplate');
const SubmittedForm = require('./SubmittedForm');
const Notification = require('./Notification');
const Feedback = require('./Feedback');

// Department - User relationships
Department.hasMany(User, { foreignKey: 'department_id' });
User.belongsTo(Department, { foreignKey: 'department_id' });

// Department - FormTemplate relationships
Department.hasMany(FormTemplate, { foreignKey: 'department_id' });
FormTemplate.belongsTo(Department, { foreignKey: 'department_id' });

// User - FormTemplate relationships (uploaded_by)
User.hasMany(FormTemplate, { foreignKey: 'uploaded_by' });
FormTemplate.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// FormTemplate - SubmittedForm relationships
FormTemplate.hasMany(SubmittedForm, { foreignKey: 'template_id' });
SubmittedForm.belongsTo(FormTemplate, { foreignKey: 'template_id' });

// User - SubmittedForm relationships (student)
User.hasMany(SubmittedForm, { foreignKey: 'student_id' });
SubmittedForm.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// User - SubmittedForm relationships (staff)
User.hasMany(SubmittedForm, { foreignKey: 'assigned_staff_id' });
SubmittedForm.belongsTo(User, { foreignKey: 'assigned_staff_id', as: 'assignedStaff' });

// Department - SubmittedForm relationships
Department.hasMany(SubmittedForm, { foreignKey: 'department_id' });
SubmittedForm.belongsTo(Department, { foreignKey: 'department_id' });

// User - Notification relationships
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// SubmittedForm - Notification relationships
SubmittedForm.hasMany(Notification, { foreignKey: 'submission_id' });
Notification.belongsTo(SubmittedForm, { foreignKey: 'submission_id' });

// SubmittedForm - Feedback relationships
SubmittedForm.hasOne(Feedback, { foreignKey: 'submission_id' });
Feedback.belongsTo(SubmittedForm, { foreignKey: 'submission_id' });

// User - Feedback relationships
User.hasMany(Feedback, { foreignKey: 'student_id' });
Feedback.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

module.exports = {
    Department,
    User,
    FormTemplate,
    SubmittedForm,
    Notification,
    Feedback
}; 