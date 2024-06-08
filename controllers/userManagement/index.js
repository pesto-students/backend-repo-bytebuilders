const UserModel = require("../../models/userModel");
const OrganisationModel = require('../../models/organisationModel');
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const cache = require("memory-cache");
const generateOrganisationUniqueId = require("../../utils/generateOrganisationUniqueId");


dotenv.config();

const secretKey = process.env.SECRET_KEY;

const registerUser = async (req, res) => {
  try {
    // Generate unique organization ID from organization name    
    const organisationName = req.body.organisationName;
    let generatedOrgId = generateOrganisationUniqueId(organisationName);

    // Check if generatedOrgId already exists in OrganisationModel
    let orgExists = await OrganisationModel.exists({ organisationUniqueId: generatedOrgId });

    // If orgExists is true, generate a new ID recursively until unique
    while (orgExists) {
      generatedOrgId = generateOrganisationUniqueId(organisationName);
      orgExists = await OrganisationModel.exists({ organisationUniqueId: generatedOrgId });
    }

    const organization = new OrganisationModel({
      organisationName: organisationName,
      organisationUniqueId: generatedOrgId
    });
    await organization.save();

    // Creating user model
    const userModel = new UserModel({
      ...req.body,
      organisationUniqueId: generatedOrgId
    });

    // Hashing the password
    userModel.password = await bcrypt.hash(req.body.password, 10);

    // Saving user data
    const response = await userModel.save();
    
    response.password = undefined;

    return res.status(201).json({
      message: "Success",
      data: response,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};


const loginUser = async (req, res) => {
    try {
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        return res.status(401).json({
          message: "Auth failed, Invalid credentials",
        });
      }
  
      const isPassEqual = await bcrypt.compare(req.body.password, user.password);
      if (!isPassEqual) {
        return res.status(401).json({
          message: "Auth failed, Wrong password, please try again",
        });
      }
  
      // Generate access token (valid for 6 hours)
      const accessToken = jwt.sign(
        { _id: user._id, fullName: user.fullName, email: user.email },
        secretKey,
        { expiresIn: '6h' }
      );
  
      // Generate refresh token (valid for 1 month)
      const refreshToken = jwt.sign(
        { _id: user._id, fullName: user.fullName, email: user.email },
        secretKey,
        { expiresIn: '30d' }
      );
  
      // Save refresh token to user document
      user.refreshToken = refreshToken;
      await user.save();
  
      // Include user object in the response
      const userResponse = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        created_at: user.created_at,
        employeeIdentificationCode: user.employeeIdentificationCode,
        joiningDate: user.joiningDate,
        dateOfBirth:user.dateOfBirth,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isOwner: user.isOwner,
        casualLeaveDays: user.casualLeaveDays,
        salary: user.salary,
        currency: user.currency,
        medicalLeaveDays: user.medicalLeaveDays,
        lopLeaveDays: user.lopLeaveDays,
        department: user.department,
        designation: user.designation,
        isEmployeeActive:user.isEmployeeActive,
        isReportingManager: user.isReportingManager,
        reportingManager: user.reportingManager,
        basicSalary: user.basicSalary,
        hra: user.hra,
        pf: user.pf,
        specialAllowances: user.specialAllowances,
        canAddEmployees: user.canAddEmployees,
        canRemoveEmployees: user.canRemoveEmployees,
        canUpdateEmployees: user.canUpdateEmployees,
        canReadHolidays: user.canReadHolidays,
        canCreateHolidays: user.canCreateHolidays,
        canDeleteHolidays: user.canDeleteHolidays,
        canAcceptOrRejectLeaves: user.canAcceptOrRejectLeaves,
        canReadLeaves: user.canReadLeaves,
        canCreateLeaves: user.canCreateLeaves,
        organisationName: user.organisationName,
        organisationUniqueId:user.organisationUniqueId
      };
      
  
      return res.status(200).json({
        user: userResponse,
        accessToken,
        refreshToken,
      });
    } catch (err) {
      return res.status(500).json({ message: "error", err });
    }
  };
  

const sendOTPForForgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiryTime = 5 * 60 * 1000;

    cache.put(email, otp, expiryTime);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

const confirmOTP = async (req, res) => {
    try {
      const email = req.body.email;
      const otp = req.body.otp;
      const newPassword = req.body.newPassword;
  
      const storedOTP = cache.get(email);

      if (storedOTP && storedOTP.toString() === otp) {
        cache.del(email);

        const user = await UserModel.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();
  
        return res.status(200).json({ message: 'Password updated successfully' });
      } else {
        // OTP is invalid or does not match the stored OTP
        return res.status(400).json({ message: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error confirming OTP:', error);
      return res.status(500).json({ message: 'Failed to confirm OTP' });
    }
  };
  

module.exports = {
  registerUser,
  loginUser,
  sendOTPForForgetPassword,
  confirmOTP,
};



// function generateOrganisationUniqueId(companyName) {
    
//   const cleanName = companyName.toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
//   const numericValue = cleanName.length * 7;
//   const uniqueId = `${cleanName}-${numericValue}`;

//   return uniqueId;
// }