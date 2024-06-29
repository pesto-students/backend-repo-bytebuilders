const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DesignationAssignmentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  designation: {
    type: Schema.Types.ObjectId,
    ref: "Designation",
    required: true,
  },
  organisationName: {
    type: String,
    required: true,
  },
});

const DesignationAssignmentModel = mongoose.model(
  "DesignationAssignment",
  DesignationAssignmentSchema
);
module.exports = DesignationAssignmentModel;
