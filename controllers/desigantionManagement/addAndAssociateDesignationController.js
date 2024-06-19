const UserModel = require("../../models/userModel");
const DesignationModel = require("../../models/designationModel");
const getUserById = require("../../utils/getUserController");

const addDesignation = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if designation with the given name already exists
    const existingDesignation = await DesignationModel.findOne({ name });

    if (existingDesignation) {
      return res.status(400).json({
        message:
          "Designation with this name already exists. Please choose a different name.",
      });
    }

    const currentUser = await getUserById(req.user._id); // Assuming you have a function to fetch the current user

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!currentUser.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    // Checking authorisation
    if (!currentUser.isAdmin) {
      return res.status(403).json({
        message: "Not authorized to add designations",
      });
    }

    const organisationName = currentUser.organisationName;

    const newDesignation = new DesignationModel({ name, organisationName });

    await newDesignation.save();

    res.status(201).json({
      message: "Designation added successfully",
      data: newDesignation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllDesignationsForOrganization = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    const organisationName = user.organisationName;

    // Check if organisationName is provided
    if (!organisationName) {
      return res.status(400).json({ message: "Organisation name is required" });
    }

    // Find all designations for the specified organisation
    const designations = await DesignationModel.find({ organisationName });

    res.status(200).json({ data: designations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addDesignation,
  getAllDesignationsForOrganization,
};
