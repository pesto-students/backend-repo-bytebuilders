const express = require("express");
const {
  userRegisterValidate,
  userLoginValidate,
  emailValidate,
  otpValidate,
  employeeRegisterValidate,
} = require("../middleware/validation/userValidation");
const {
  registerUser,
  loginUser,
  sendOTPForForgetPassword,
  confirmOTP,
} = require("../controllers/userManagement/index");
const {
  addDepartment,
  getAllDepartmentsForOrganization,
} = require("../controllers/departmentManagement/addAndAssociateDepartmentController");
const {
  addDesignation,
  getAllDesignationsForOrganization,
} = require("../controllers/desigantionManagement/addAndAssociateDesignationController");
const {
  addEmployee,
  updateEmployee,
  deactivateEmployee,
  getAllEmployees,
  getParticularEmployee,
  getUserDetailsFromAccessToken,
  setPasswordForEmployee,
} = require("../controllers/employeeManagement/employeeManagementController");
const {
  addHoliday,
  getAllHolidaysByOrganization,
} = require("../controllers/holidayManagement/holidayManagementController");
const {
  punchIn,
  punchOut,
  getPunchData,
} = require("../controllers/attendanceManagement/attendanceController");
const {
  addLeave,
  getLeaveHistory,
  processLeave,
  getSubordinateLeaveRequests,
} = require("../controllers/leaveManagement/leaveManagementController");
const {
  queryEmployeesOnLeave,
} = require("../controllers/miscellaneousFunctions/whoIsOnLeave");
const {
  queryEmployeesBirthdayOnCurrentDay,
} = require("../controllers/miscellaneousFunctions/whoseBirthDay");
const {
  generatePayslip,
} = require("../controllers/payrollManagement/payrollManagementController");
const {
  getpayslipUrl,
} = require("../controllers/payrollManagement/getpayslipS3Url");
const {
  createTeam,
  addMembersToTeam,
  removeMembersFromTeam,
  updateTeamName,
  deleteTeam,
  getAllTeams,
  getParticularTeamDetails,
  fetchYourOwnTeam,
} = require("../controllers/teamManagemnt/teamManagementController");

const authenticateUser = require("../middleware/authenticae/authenticateUser");

const routes = express.Router();

// Route for user registration
routes.post("/register", userRegisterValidate, registerUser);

// Route for user login
routes.post("/login", userLoginValidate, loginUser);

// Route for sending OTP for forgot password
routes.post("/forgot-password", emailValidate, sendOTPForForgetPassword);

// confirm Otp and save new password
routes.post("/confirm-otp", otpValidate, confirmOTP);

// adding employees in organisation
routes.post(
  "/add-employee",
  authenticateUser,
  employeeRegisterValidate,
  addEmployee
);

// update user
routes.put(
  "/employees/:id",
  authenticateUser,
  employeeRegisterValidate,
  updateEmployee
);

// deactivate user
routes.post("/employees-deactivate/:id", authenticateUser, deactivateEmployee);

// get all employees
routes.get("/get-all-employees", authenticateUser, getAllEmployees);

// particular user detail
routes.get(
  "/get-particular-employee/:id",
  authenticateUser,
  getParticularEmployee
);

// particular user detail from access token
routes.get(
  "/get-user-details",
  authenticateUser,
  getUserDetailsFromAccessToken
);

routes.patch(
  "/update-password/:userid",
  authenticateUser,
  setPasswordForEmployee
);

// add designation
routes.post("/add-designation", authenticateUser, addDesignation);

// get all designations
routes.get(
  "/get-all-designations",
  authenticateUser,
  getAllDesignationsForOrganization
);

// add department
routes.post("/add-department", authenticateUser, addDepartment);

// get all department
routes.get(
  "/get-all-departments",
  authenticateUser,
  getAllDepartmentsForOrganization
);

// add holiday(s)
routes.post("/add-holiday", authenticateUser, addHoliday);

// get all holidays
routes.get("/get-all-holidays", authenticateUser, getAllHolidaysByOrganization);

// punch in
routes.post("/punch-in", authenticateUser, punchIn);

// punch in
routes.post("/punch-out", authenticateUser, punchOut);

// get puch data current day and time data
routes.get("/punch-data", authenticateUser, getPunchData);

// add leave
routes.post("/add-leave", authenticateUser, addLeave);

// get leave history
routes.get("/get-leave-history", authenticateUser, getLeaveHistory);

// process leave
routes.post("/process-leave", authenticateUser, processLeave);

// get leave requests
// process leave
routes.get("/leave-requests", authenticateUser, getSubordinateLeaveRequests);

// querying employees on leave
routes.get("/query-leave-employees", authenticateUser, queryEmployeesOnLeave);

// querying birthday(s) on current date
routes.get(
  "/get-all-employees-birthdays-current-date",
  authenticateUser,
  queryEmployeesBirthdayOnCurrentDay
);

// payslip generation
routes.post("/generate-payslip", authenticateUser, generatePayslip);

// get payslips
routes.post("/download-payslip", authenticateUser, getpayslipUrl);

// Create a team
routes.post("/create-team", authenticateUser, createTeam); // completed

// Add members to a team
routes.put("/add-members/:teamId", authenticateUser, addMembersToTeam); // completed

// Remove members from a team
routes.put("/remove-members/:teamId", authenticateUser, removeMembersFromTeam); // completed

// Update team name
routes.put("/update-team/:teamId", authenticateUser, updateTeamName);

// Delete team
routes.delete("/delete-team/:teamId", authenticateUser, deleteTeam);

// get all teams
routes.get("/get-all-teams", authenticateUser, getAllTeams);

// get particular team details
routes.get(
  "/get-team-details/:teamId",
  authenticateUser,
  getParticularTeamDetails
);

// fetch your own team
routes.get("/fetch-your-own-team", authenticateUser, fetchYourOwnTeam);


routes.get(
  '/.well-known/pki-validation/46013F07675AFEED4447AB700DCA52C0',
  (req, res) => {
    res.sendStatus(200);
    res.sendFile(`/46013F07675AFEED4447AB700DCA52C0.txt`);
  }
);


module.exports = routes;
