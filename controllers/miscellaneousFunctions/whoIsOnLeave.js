const UserModel = require("../../models/userModel");
const LeaveModel = require("../../models/leaveModel");

const queryEmployeesOnLeave = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await UserModel.findById(userId);
        const organisationId = user.organisationUniqueId;

        const currentDate = new Date();
        const leavesOnCurrentDate = await LeaveModel.find({
            start_date: { $lte: currentDate },
            end_date: { $gte: currentDate },
            organisationUniqueId: organisationId // Filter by organisation ID
        });

        const uniqueUserIds = [...new Set(leavesOnCurrentDate.map(leave => leave.user))];

        const employeesOnLeave = await UserModel.find({ _id: { $in: uniqueUserIds } });
        
        return res.status(200).json(employeesOnLeave);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    queryEmployeesOnLeave
};
