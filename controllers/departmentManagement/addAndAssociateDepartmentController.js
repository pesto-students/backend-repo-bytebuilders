const UserModel = require("../../models/userModel");
const departmentModel = require("../../models/departmentModel");
const getUserById = require("../../utils/getUserController");

const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if department with the given name already exists
    const existingDepartment = await departmentModel.findOne({ name });

    if (existingDepartment) {
      return res.status(400).json({
        message:
          "Department with this name already exists. Please choose a different name.",
      });
    }

    const currentUser = await getUserById(req.user._id); // Assuming you have a function to fetch the current user

    // Checking authorisation
    if (!currentUser.isAdmin) {
      return res.status(403).json({
        message: "Not authorized to add departments",
      });
    }

    const organisationName = currentUser.organisationName;

    const newDepartment = new departmentModel({ name, organisationName });

    await newDepartment.save();

    res.status(201).json({
      message: "Department added successfully",
      data: newDepartment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllDepartmentsForOrganization = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);

    const organisationName = user.organisationName;

    // Check if organisationName is provided
    if (!organisationName) {
      return res.status(400).json({ message: "Organisation name is required" });
    }

    // Find all departments for the specified organisation
    const departments = await departmentModel.find({ organisationName });

    res.status(200).json({ data: departments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addDepartment,
  getAllDepartmentsForOrganization,
};
