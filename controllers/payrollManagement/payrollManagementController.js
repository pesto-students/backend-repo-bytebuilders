const fs = require("fs");
const UserModel = require("../../models/userModel");
const htmlToPdf = require("html-pdf");
const nodemailer = require("nodemailer");
const s3 = require("../../config/awsConfig");
const Payslip = require("../../models/paySlipModel");

const generatePayslip = async (req, res) => {
  try {
    const { userId, month, year } = req.body;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const payslipTemplateSource = fs.readFileSync(
      "templates/payslipTemplate.html",
      "utf8"
    );

    const payslipHTML = payslipTemplateSource
      .replace("{{employeeName}}", user.fullName)
      .replace("{{joiningDate}}", user.joiningDate.toDateString())
      .replace("{{employeeId}}", user.employeeIdentificationCode.toString())
      .replace("{{designation}}", user.designation)
      .replace("{{dateOfPayslipGeneration}}", `${month}/${year}`)
      .replace("{{basicSalary}}", user.basicSalary)
      .replace("{{hra}}", user.hra)
      .replace("{{pf}}", user.pf)
      .replace("{{specialAllowances}}", user.specialAllowances)
      .replace(
        "{{totalSalary}}",
        user.basicSalary + user.hra + user.pf + user.specialAllowances
      );

    htmlToPdf.create(payslipHTML).toBuffer(async (err, buffer) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error generating PDF" });
      }

      const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `payslips/${user._id}/${year}-${month}.pdf`,
        Body: buffer,
        ContentType: "application/pdf",
      };
      await s3.upload(s3Params).promise();

      const payslipData = new Payslip({
        userId: user._id,
        s3Url: `${process.env.AWS_S3_BUCKET_URL}/${s3Params.Key}`,
        month: month,
        year: year,
      });
      await payslipData.save();

      const emailTemplateSource = fs.readFileSync(
        "templates/payslipEmailTemplate.html",
        "utf8"
      );

      const emailHTML = emailTemplateSource
        .replace("{{full_name}}", user.fullName)
        .replace("{{dateOfPayslipGeneration}}", `${month}/${year}`)
        .replace(
          "{{download_Payslip}}",
          `${process.env.AWS_S3_BUCKET_URL}/${s3Params.Key}`
        );

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to: "mnihar198@gmail.com",
        subject: `Your Payslip for ${month}/${year}`,
        html: emailHTML,
      };

      await transporter.sendMail(mailOptions);

      res
        .status(200)
        .json({ message: "Payslip generated and emailed successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  generatePayslip,
};
