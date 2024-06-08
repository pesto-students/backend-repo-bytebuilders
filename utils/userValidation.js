const Joi = require("joi");

const userRegisterValidate = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).alphanum().required(),
    dateOfBirth: Joi.date().iso().default(() => new Date().toISOString()),
    employeeIdentificationCode: Joi.string().required(),
    joiningDate: Joi.date().iso().default(() => new Date().toISOString()),
    phone: Joi.string().required(),
    isAdmin: Joi.boolean().required(),
    isOwner: Joi.boolean().required(),
    casualLeaveDays: Joi.number().integer().min(0).required(),
    salary: Joi.number().required(),
    currency: Joi.string().required(),
    medicalLeaveDays: Joi.number().integer().min(0).required(),
    lopLeaveDays: Joi.number().allow(null),
    isEmployeeActive : Joi.boolean().required(),
    isReportingManager: Joi.boolean().required(),
    basicSalary: Joi.number().required(),
    hra: Joi.number().required(),
    pf: Joi.number().required(),
    specialAllowances: Joi.number().required(),
    canAddEmployees: Joi.boolean().required(),
    canRemoveEmployees: Joi.boolean().required(),
    canUpdateEmployees: Joi.boolean().required(),
    canReadHolidays: Joi.boolean().required(),
    canCreateHolidays: Joi.boolean().required(),
    canDeleteHolidays: Joi.boolean().required(),
    canAcceptOrRejectLeaves: Joi.boolean().required(),
    canReadLeaves: Joi.boolean().required(),
    canCreateLeaves: Joi.boolean().required(),
    organisationName:Joi.string().required(),
    department: "",
    designation: ""
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    console.error(error); // Log the error to see what's happening
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};


const employeeRegisterValidate = (req, res, next) => {

  

  const schema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(0).alphanum().required(),
    dateOfBirth: Joi.date().iso().default(() => new Date().toISOString()),
    employeeIdentificationCode: Joi.string().required(),
    joiningDate: Joi.date().iso().default(() => new Date().toISOString()),
    phone: Joi.string().required(),
    isAdmin: Joi.boolean().required(),
    isOwner: Joi.boolean().required(),
    casualLeaveDays: Joi.number().integer().min(0).required(),
    salary: Joi.number().required(),
    currency: Joi.string().required(),
    medicalLeaveDays: Joi.number().integer().min(0).required(),
    lopLeaveDays: Joi.number().allow(null),
    isEmployeeActive : Joi.boolean().required(),
    isReportingManager: Joi.boolean().required(),
    reportingManager:Joi.string().required(),
    basicSalary: Joi.number().required(),
    hra: Joi.number().required(),
    pf: Joi.number().required(),
    specialAllowances: Joi.number().required(),
    canAddEmployees: Joi.boolean().required(),
    canRemoveEmployees: Joi.boolean().required(),
    canUpdateEmployees: Joi.boolean().required(),
    canReadHolidays: Joi.boolean().required(),
    canCreateHolidays: Joi.boolean().required(),
    canDeleteHolidays: Joi.boolean().required(),
    canAcceptOrRejectLeaves: Joi.boolean().required(),
    canReadLeaves: Joi.boolean().required(),
    canCreateLeaves: Joi.boolean().required(),
    department: Joi.string().required(),
    designation: Joi.string().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    console.error(error); // Log the error to see what's happening
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};



const userLoginValidate = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).alphanum().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
};



const emailValidate = (req, res, next) =>{
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
}

const otpValidate = (req, res, next) =>{
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp:Joi.string().required(),
    newPassword:Joi.string().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error });
  }
  next();
}


module.exports = {
    userRegisterValidate,
    userLoginValidate,
    employeeRegisterValidate,
    emailValidate,
    otpValidate
}
