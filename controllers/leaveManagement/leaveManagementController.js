const LeaveModel = require("../../models/leaveModel");
const UserModel = require("../../models/userModel");
const HolidayModel = require("../../models/holidayModel");
const teamModel = require("../../models/teamModel");
const nodemailer = require("nodemailer");
const fs = require("fs");

const getUserById = require("../../utils/getUserController");

const addLeave = async (req, res) => {
  try {
    const { leave_type, start_date, end_date, leave_reason } = req.body;
    const user = await getUserById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    // Get the team of the user
    const team = await teamModel.findOne({ members: user._id });
    if (!team) {
      return res.status(404).json({ message: "User is not part of any team." });
    }

    const organisationId = user.organisationUniqueId;

    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: "Start date cannot be after end date." });
    }

    const overlappingLeave = await LeaveModel.find({
      user: user._id,
      leave_status: { $nin: ["rejected", "cancelled"] },
      $or: [
        { start_date: { $lte: end_date }, end_date: { $gte: start_date } },
        { start_date: { $gte: start_date, $lte: end_date } },
        { end_date: { $gte: start_date, $lte: end_date } },
      ],
    });

    if (overlappingLeave.length > 0) {
      return res.status(400).json({
        message: "Leave request overlaps with an existing leave entry. Please check your leave schedule.",
      });
    }

    let requestedDays = 0;
    let currentDate = new Date(start_date);
    const endDate = new Date(end_date);

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Skip weekends
        const isHoliday = await HolidayModel.exists({ date: currentDate });
        if (!isHoliday) {
          requestedDays++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const remainingLeaveDays = user[`${leave_type}LeaveDays`];

    if (requestedDays > remainingLeaveDays) {
      const extraDays = requestedDays - remainingLeaveDays;
      return res.status(400).json({
        message: `Not enough leave days. You are requesting ${extraDays} extra days. Please connect with HR.`,
      });
    }

    user[`${leave_type}LeaveDays`] -= requestedDays;
    await user.save();

    const newLeave = new LeaveModel({
      user: user._id,
      leave_type,
      start_date,
      end_date,
      noOfDays: requestedDays,
      organisationUniqueId: organisationId,
      leave_reason,
      reportingManager: team.reportingManager,
      apply_date: new Date(),
    });

    await newLeave.save();

    // Query the reporting manager's details
    const reportingManager = await UserModel.findById(team.reportingManager);

    if (!reportingManager) {
      return res.status(404).json({ message: "Reporting manager not found." });
    }

    const toMail = reportingManager.email;

    // Send email notification to reporting manager
    const emailTemplate = fs.readFileSync("templates/leaveNotification.html", "utf8");

    const htmlContent = emailTemplate
      .replace("{{reportingManagerName}}", reportingManager.fullName)
      .replace("{{fullName}}", user.fullName)
      .replace("{{leaveType}}", leave_type)
      .replace("{{startDate}}", start_date)
      .replace("{{endDate}}", end_date)
      .replace("{{reason}}", leave_reason);

    // SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: [toMail, "mnihar198@gmail.com"],
      subject: "New Leave Request Notification",
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: "Leave added successfully",
      reason: leave_reason,
      leave_id: newLeave._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const getLeaveHistory = async (req, res) => {
  try {
    // Fetch user details from the database
    const user = await getUserById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    // Retrieve leave history for the user
    const leaveHistory = await LeaveModel.find({ user: req.user._id });
    const leaveData = leaveHistory.map((leave) => ({
      apply_date: leave.apply_date,
      leave_type: leave.leave_type,
      start_date: leave.start_date,
      end_date: leave.end_date,
      leaveStatus: leave.leave_status,
      processedBy: leave.processedBy,
      leaveId: leave._id,
      reason: leave.leave_reason,
      userId: leave.user,
    }));

    // Return the leave history
    return res.status(200).json(leaveData.reverse());
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const processLeave = async (req, res) => {
  try {
    const loggedInUser = await getUserById(req.user._id);

    if (!loggedInUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!loggedInUser.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    const { leave_id, action } = req.body;

    if (action !== "cancel") {
      if (!loggedInUser.isAdmin) {
        return res.status(401).json({ message: "Not authorized" });
      }
    }

    const leave = await LeaveModel.findById(leave_id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.leaveProcessed) {
      return res.status(409).json({
        message: `Leave request already processed - ${leave.leave_status}`,
      });
    }

    if (action !== "cancel") {
      if (leave.reportingManager.toString() !== loggedInUser._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to process this leave request" });
      }
    }

    const user = await UserModel.findById(leave.user);

    if (action === "approve") {
      leave.approved = true;
      leave.leave_status = "approved";
      leave.leaveProcessed = true;
      leave.processedBy = loggedInUser;
      await leave.save();
      return res
        .status(200)
        .json({ message: "Leave request approved successfully" });
    } else if (action === "reject" || action === "cancel") {
      const leave_days = leave.noOfDays;
      const leave_type = leave.leave_type;
      user[`${leave_type}LeaveDays`] += leave_days;
      await user.save();

      leave.approved = false;
      leave.leave_status = action === "reject" ? "rejected" : "cancelled";
      leave.leaveProcessed = true;
      leave.processedBy = loggedInUser;
      await leave.save();
      return res.status(200).json({
        message: `Leave request ${
          action === "reject" ? "rejected" : "cancelled"
        } successfully`,
      });
    } else {
      return res.status(400).json({
        message: "Invalid action. Use 'approve', 'reject', or 'cancel'.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSubordinateLeaveRequests = async (req, res) => {
  try {
    // Get the reporting manager details
    const reportingManager = await getUserById(req.user._id);

    if (!reportingManager) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!reportingManager.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    // Check if the user is a reporting manager
    if (!reportingManager.isReportingManager) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find the team where the reporting manager is the manager
    const team = await teamModel
      .findOne({ reportingManager: reportingManager._id })
      .populate("members");

    if (!team) {
      return res
        .status(404)
        .json({ message: "No team found for this reporting manager" });
    }

    // Get the members' IDs
    const memberIds = team.members.map((member) => member._id);

    // Find all leave requests by these members
    const leaveRequests = await LeaveModel.find({ user: { $in: memberIds } })
      .populate("user", "fullName email")
      .populate("processedBy", "fullName email");

    // Map the leave requests to a simpler structure
    const leaveData = leaveRequests.map((leave) => ({
      leave_type: leave.leave_type,
      start_date: leave.start_date,
      end_date: leave.end_date,
      apply_date: leave.apply_date, // Include the apply_date in the response
      leaveStatus: leave.leave_status,
      processedBy: leave.processedBy ? leave.processedBy.fullName : null,
      leaveId: leave._id,
      userId: leave.user._id,
      userName: leave.user.fullName,
      userEmail: leave.user.email,
      leaveReason: leave.leave_reason,
    }));

    // Return the leave data as a JSON response
    return res.status(200).json(leaveData);
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addLeave,
  getLeaveHistory,
  processLeave,
  getSubordinateLeaveRequests,
};
