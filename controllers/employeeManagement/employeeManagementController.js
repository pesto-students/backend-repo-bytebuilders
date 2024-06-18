const UserModel = require("../../models/userModel");
const bcrypt = require("bcrypt");
const generatePassword = require("../../utils/generatePassword");
const getUserById = require("../../utils/getUserController");
const nodemailer = require("nodemailer");

const fs = require("fs");

const addEmployee = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);

    // Checking authorisation
    if (!user.isAdmin && !user.canAddEmployees) {
      return res
        .status(403)
        .json({ message: "Not authorized to add employees" });
    }

    const organisationName = user.organisationName;

    req.body.organisationName = organisationName;

    const userModel = new UserModel(req.body);

    const generatedPassword = generatePassword();
    userModel.password = await bcrypt.hash(generatedPassword, 10);

    const organisationId = user.organisationUniqueId;
    userModel.organisationUniqueId = organisationId;

    const emailTemplate = fs.readFileSync("templates/welcomeUser.html", "utf8");

    const htmlContent = emailTemplate
      .replace("{{organisation}}", userModel.organisationName)
      .replace("{{fullName}}", userModel.fullName)
      .replace("{{email}}", userModel.email)
      .replace("{{generatedPassword}}", generatedPassword)
      .replace("{{employeeId}}", userModel.employeeIdentificationCode)
      .replace("{{ReportingManager}}", userModel.reportingManager);

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
      to: [req.user.email, "mnihar198@gmail.com"],
      subject: "Welcome to Our Company",
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Save user model
    const response = await userModel.save();

    // Remove password field from response
    response.password = undefined;

    return res.status(201).json({
      message: "Success",
      data: response,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error",
      err,
    });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    // Fetch the current user making the request
    const currentUser = await getUserById(req.user._id);

    // Checking authorisation
    if (!currentUser.canAddEmployees && !currentUser.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update employees" });
    }

    // Find the employee by ID
    const currentEmployee = await UserModel.findById(id);

    if (!currentEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update password if provided
    if (updateFields.password) {
      currentEmployee.password = await bcrypt.hash(updateFields.password, 10);
    }

    // Update other fields in updateFields
    Object.keys(updateFields).forEach((field) => {
      if (updateFields[field] !== undefined && field !== "password") {
        currentEmployee[field] = updateFields[field];
      }
    });

    // Save updated employee
    const updatedEmployee = await currentEmployee.save();

    // Respond with updated employee data
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deactivateEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the current user making the request
    const currentUser = await getUserById(req.user._id);

    // Check if the current user is authorized to update employees
    if (!currentUser.canAddEmployees && !currentUser.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to deactivate employees" });
    }

    // Find the employee by ID
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Deactivate the employee
    user.isEmployeeActive = false;

    // Save the updated employee
    await user.save();

    // Respond with success message
    res.status(200).json({ message: "Employee deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const organisationName = user.organisationName;

    const users = await UserModel.find({
      organisationName: organisationName,
      isEmployeeActive: true,
    }).select("-password");

    res.json({ message: "Employees fetched successfully", data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getParticularEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Employee queried successfully", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserDetailsFromAccessToken = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const userId = req.user._id;

    if (typeof userId !== "string" || userId.trim() === "") {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addEmployee,
  updateEmployee,
  deactivateEmployee,
  getAllEmployees,
  getParticularEmployee,
  getUserDetailsFromAccessToken,
};
