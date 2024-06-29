const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  organisationName: {
    type: String,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const DepartmentModel = mongoose.model("Department", DepartmentSchema);
module.exports = DepartmentModel;
