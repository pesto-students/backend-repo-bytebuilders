const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: false
    },
    password: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    employeeIdentificationCode: {
        type: String,
        required: true
    },
    joiningDate: {
        type: Date,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isOwner: {
        type: Boolean,
        default: true
    },
    casualLeaveDays: {
        type: Number,
        default: 10
    },
    salary: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    medicalLeaveDays: {
        type: Number,
        default: 5
    },
    lopLeaveDays: {
        type: Number,
        default: null
    },
    isEmployeeActive: {
        type: Boolean,
        default: false
    },
    reportingManager: {
        type: String,
        default: null
    },
    isReportingManager: {
        type: Boolean,
        default: false
    },
    basicSalary: {
        type: Number,
        required: true
    },
    hra: {
        type: Number,
        required: true
    },
    pf: {
        type: Number,
        required: true
    },
    specialAllowances: {
        type: Number,
        required: true
    },
    canAddEmployees: {
        type: Boolean,
        default: true
    },
    canRemoveEmployees: {
        type: Boolean,
        default: true
    },
    canUpdateEmployees: {
        type: Boolean,
        default: true
    },
    canReadHolidays: {
        type: Boolean,
        default: true
    },
    canCreateHolidays: {
        type: Boolean,
        default: true
    },
    canDeleteHolidays: {
        type: Boolean,
        default: true
    },
    canAcceptOrRejectLeaves: {
        type: Boolean,
        default: true
    },
    canReadLeaves: {
        type: Boolean,
        default: true
    },
    canCreateLeaves: {
        type: Boolean,
        default: true
    },
    organisationName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: false
    },
    designation: {
        type: String,
        required: false
    },
    organisationUniqueId: {
        type: String,
        required: true
    }
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
