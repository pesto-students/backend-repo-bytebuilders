const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DesignationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    organisationName: {
        type: String,
        required: true
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const DesignationModel = mongoose.model('Designation', DesignationSchema);
module.exports = DesignationModel;
