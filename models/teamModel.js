const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: {
    type: String,
    required: true,
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

// Create a compound index on name and organizationId to ensure uniqueness within an organization
TeamSchema.index({ name: 1, organizationId: 1 }, { unique: true });

const TeamModel = mongoose.model("Team", TeamSchema);
module.exports = TeamModel;
