const User = require("../../models/userModel");
const Payslip = require("../../models/paySlipModel");

const userObj = require("../../utils/getUserController");
const getUserById = require("../../utils/getUserController");

const getpayslipUrl = async (req, res) => {
  try {
    const use = await getUserById(req.user._id);

    if (!use) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!use.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }


    const userId = use.id;
    const month = req.body.month;
    const year = req.body.year;

    // Check if userId exists in the User model
    // const user = await User.findById(userId);
    

    

    const payslip = await Payslip.findOne({ userId, month, year });

    if (!payslip) {
      return res
        .status(404)
        .json({ error: "Payslip not found, kindly contact HR" });
    }

    return res.json({ payslipUrl: payslip.s3Url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error retrieving payslip S3 URL" });
  }
};

module.exports = {
  getpayslipUrl,
};
