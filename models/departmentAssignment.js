const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DepartmentAssignmentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  organisationName: {
    type: String,
    required: true,
  },
});

const DepartmentAssignmentModel = mongoose.model(
  "DepartmentAssignment",
  DepartmentAssignmentSchema
);
module.exports = DepartmentAssignmentModel;
