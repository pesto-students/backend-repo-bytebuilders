const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HolidaySchema = new Schema({
    date: {
        type: Date,
        unique: true,
        required: true
    },
    name: {
        type: String,
        maxlength: 255,
        default: ''
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organisation: {
        type: String,
        maxlength: 255,
        default: ''
    },
});

const HolidayModel = mongoose.model('Holiday', HolidaySchema);

module.exports = HolidayModel;
