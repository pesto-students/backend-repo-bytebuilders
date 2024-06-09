const UserModel = require("../../models/userModel");
const bcrypt = require("bcrypt");
const generatePassword = require("../../utils/generatePassword");
const getUserById = require("../../utils/getUserController");
const nodemailer = require("nodemailer");

const fs = require("fs");

const addEmployee = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);
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
      to: "mnihar198@gmail.com",
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
    const currentEmployee = await UserModel.findById(id);

    if (
      (updateFields.password &&
        updateFields.password !== currentEmployee.password) ||
      (updateFields.password &&
        updateFields.password === currentEmployee.password)
    ) {
      currentEmployee.password = await bcrypt.hash(updateFields.password, 10);
    } else if (!updateFields.password && currentEmployee.password) {
      currentEmployee.password = await bcrypt.hash(
        currentEmployee.password,
        10
      );
    }

    Object.keys(updateFields).forEach((field) => {
      if (updateFields[field] !== undefined && field !== "password") {
        currentEmployee[field] = updateFields[field];
      }
    });

    const updatedEmployee = await currentEmployee.save();

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deactivateEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isEmployeeActive = false;

    user.save();

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

module.exports = {
  addEmployee,
  updateEmployee,
  deactivateEmployee,
  getAllEmployees,
  getParticularEmployee,
};
