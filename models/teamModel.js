const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  organizationId: {
    type: String,
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  reportingManager: {
    type: Schema.Types.ObjectId,
    ref: "User",
    null: true,
  },
});

const TeamModel = mongoose.model("Team", TeamSchema);
module.exports = TeamModel;
