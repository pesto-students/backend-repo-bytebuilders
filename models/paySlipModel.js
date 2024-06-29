const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  s3Url: {
    type: String,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

const Payslip = mongoose.model("Payslip", payslipSchema);

module.exports = Payslip;
