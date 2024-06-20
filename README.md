# API Documentation

This API provides various functionalities for managing an organization, including user management, employee management, department and designation management, holiday management, attendance management, leave management, payroll management, and team management.

## Table of Contents
- [User Management](#user-management)
- [Employee Management](#employee-management)
- [Department Management](#department-management)
- [Designation Management](#designation-management)
- [Holiday Management](#holiday-management)
- [Attendance Management](#attendance-management)
- [Leave Management](#leave-management)
- [Miscellaneous Functions](#miscellaneous-functions)
- [Payroll Management](#payroll-management)
- [Team Management](#team-management)
- [Middleware](#middleware)

## User Management

### Register User
- **Endpoint:** `/register`
- **Method:** `POST`
- **Middleware:** `userRegisterValidate`
- **Controller:** `registerUser`

### Login User
- **Endpoint:** `/login`
- **Method:** `POST`
- **Middleware:** `userLoginValidate`
- **Controller:** `loginUser`

### Forgot Password
- **Endpoint:** `/forgot-password`
- **Method:** `POST`
- **Middleware:** `emailValidate`
- **Controller:** `sendOTPForForgetPassword`

### Confirm OTP and Set New Password
- **Endpoint:** `/confirm-otp`
- **Method:** `POST`
- **Middleware:** `otpValidate`
- **Controller:** `confirmOTP`

## Employee Management

### Add Employee
- **Endpoint:** `/add-employee`
- **Method:** `POST`
- **Middleware:** `authenticateUser`, `employeeRegisterValidate`
- **Controller:** `addEmployee`

### Update Employee
- **Endpoint:** `/employees/:id`
- **Method:** `PUT`
- **Middleware:** `authenticateUser`, `employeeRegisterValidate`
- **Controller:** `updateEmployee`

### Deactivate Employee
- **Endpoint:** `/employees-deactivate/:id`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `deactivateEmployee`

### Get All Employees
- **Endpoint:** `/get-all-employees`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getAllEmployees`

### Get Particular Employee
- **Endpoint:** `/get-particular-employee/:id`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getParticularEmployee`

### Get User Details From Access Token
- **Endpoint:** `/get-user-details`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getUserDetailsFromAccessToken`

### Set Password for Employee
- **Endpoint:** `/update-password/:userid`
- **Method:** `PATCH`
- **Middleware:** `authenticateUser`
- **Controller:** `setPasswordForEmployee`

## Department Management

### Add Department
- **Endpoint:** `/add-department`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `addDepartment`

### Get All Departments
- **Endpoint:** `/get-all-departments`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getAllDepartmentsForOrganization`

## Designation Management

### Add Designation
- **Endpoint:** `/add-designation`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `addDesignation`

### Get All Designations
- **Endpoint:** `/get-all-designations`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getAllDesignationsForOrganization`

## Holiday Management

### Add Holiday
- **Endpoint:** `/add-holiday`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `addHoliday`

### Get All Holidays
- **Endpoint:** `/get-all-holidays`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getAllHolidaysByOrganization`

## Attendance Management

### Punch In
- **Endpoint:** `/punch-in`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `punchIn`

### Punch Out
- **Endpoint:** `/punch-out`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `punchOut`

### Get Punch Data
- **Endpoint:** `/punch-data`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getPunchData`

## Leave Management

### Add Leave
- **Endpoint:** `/add-leave`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `addLeave`

### Get Leave History
- **Endpoint:** `/get-leave-history`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getLeaveHistory`

### Process Leave
- **Endpoint:** `/process-leave`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `processLeave`

### Get Subordinate Leave Requests
- **Endpoint:** `/leave-requests`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getSubordinateLeaveRequests`

## Miscellaneous Functions

### Query Employees on Leave
- **Endpoint:** `/query-leave-employees`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `queryEmployeesOnLeave`

### Query Employees' Birthdays on Current Date
- **Endpoint:** `/get-all-employees-birthdays-current-date`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `queryEmployeesBirthdayOnCurrentDay`

## Payroll Management

### Generate Payslip
- **Endpoint:** `/generate-payslip`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `generatePayslip`

### Get Payslip URL
- **Endpoint:** `/download-payslip`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `getpayslipUrl`

## Team Management

### Create Team
- **Endpoint:** `/create-team`
- **Method:** `POST`
- **Middleware:** `authenticateUser`
- **Controller:** `createTeam`

### Add Members to Team
- **Endpoint:** `/add-members/:teamId`
- **Method:** `PUT`
- **Middleware:** `authenticateUser`
- **Controller:** `addMembersToTeam`

### Remove Members from Team
- **Endpoint:** `/remove-members/:teamId`
- **Method:** `PUT`
- **Middleware:** `authenticateUser`
- **Controller:** `removeMembersFromTeam`

### Update Team Name
- **Endpoint:** `/update-team/:teamId`
- **Method:** `PUT`
- **Middleware:** `authenticateUser`
- **Controller:** `updateTeamName`

### Delete Team
- **Endpoint:** `/delete-team/:teamId`
- **Method:** `DELETE`
- **Middleware:** `authenticateUser`
- **Controller:** `deleteTeam`

### Get All Teams
- **Endpoint:** `/get-all-teams`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getAllTeams`

### Get Particular Team Details
- **Endpoint:** `/get-team-details/:teamId`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `getParticularTeamDetails`

### Fetch Your Own Team
- **Endpoint:** `/fetch-your-own-team`
- **Method:** `GET`
- **Middleware:** `authenticateUser`
- **Controller:** `fetchYourOwnTeam`

## Middleware

### Authentication
- **Middleware:** `authenticateUser`
- **Description:** Ensures that the user is authenticated before accessing the endpoint.

### Validation
- **Middleware:** `userRegisterValidate`, `userLoginValidate`, `emailValidate`, `otpValidate`, `employeeRegisterValidate`
- **Description:** Validates the request data for the respective endpoints.
