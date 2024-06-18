const UserModel = require("../../models/userModel");
const LeaveModel = require("../../models/leaveModel");

const queryEmployeesOnLeave = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const organisationId = user.organisationUniqueId;

    if (!organisationId) {
      return res.status(400).json({ message: "Organisation ID not found for the user" });
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    console.log(`Current Date: ${currentDate}`);
    console.log(`Next Date: ${nextDate}`);

    const leavesOnCurrentDate = await LeaveModel.find({
      start_date: { $lt: nextDate },
      end_date: { $gte: currentDate },
      organisationUniqueId: organisationId
    });

    console.log(`Leaves on Current Date: ${JSON.stringify(leavesOnCurrentDate)}`);

    if (leavesOnCurrentDate.length === 0) {
      return res.status(200).json({ message: "No employees on leave today" });
    }

    const uniqueUserIds = [...new Set(leavesOnCurrentDate.map((leave) => leave.user.toString()))];
    console.log(`Unique User IDs on Leave: ${uniqueUserIds}`);

    const employeesOnLeave = await UserModel.find({
      _id: { $in: uniqueUserIds }
    });

    console.log(`Employees on Leave: ${JSON.stringify(employeesOnLeave)}`);

    return res.status(200).json(employeesOnLeave);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  queryEmployeesOnLeave,
};
