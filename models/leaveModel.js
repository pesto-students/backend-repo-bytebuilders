const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaveSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leave_type: {
        type: String,
        enum: ['casual', 'medical', 'lop'],
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    noOfDays: {
        type: Number,
        required: true
    },
    leaveProcessed: {
        type: Boolean,
        default: false
    },
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    leave_status: {
        type: String,
        enum: ['new', 'pending', 'approved', 'rejected', 'cancelled'],
        default: 'new'
    },
    organisationUniqueId: {
        type: String,
        required: true
    },
    reportingManager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    apply_date: { 
        type: Date,
        default: Date.now,
        required: true
    },
    leave_reason: {
        type: String,
        required: false // Adjust the requirement based on your needs
    }
});

const LeaveModel = mongoose.model('Leave', LeaveSchema);
module.exports = LeaveModel;
