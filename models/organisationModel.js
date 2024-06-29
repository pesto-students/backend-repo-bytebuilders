const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrganisationSchema = new Schema({
  organisationName: {
    type: String,
    required: true,
    unique: false,
  },
  organisationUniqueId: {
    type: String,
    required: true,
    unique: true,
  },
});

const OrganisationModel = mongoose.model("organisations", OrganisationSchema);
module.exports = OrganisationModel;
