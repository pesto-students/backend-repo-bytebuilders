const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    punch_times: {
        type: [String],
        default: []
    },
    first_punch_in: {
        type: String,
        default: null
    },
    last_punchout: {
        type: String,
        default: null
    },
    total_punch_time: {
        type: Number,
        default: 0
    },
    is_holiday: {
        type: Boolean,
        default: false
    }
});

const AttendanceModel = mongoose.model('attendance', AttendanceSchema);
module.exports = AttendanceModel;
