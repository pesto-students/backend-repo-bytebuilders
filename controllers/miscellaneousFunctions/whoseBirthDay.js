const UserModel = require("../../models/userModel");

const queryEmployeesBirthdayOnCurrentDay = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    const organisationId = user.organisationUniqueId;

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;

    const allUsers = await UserModel.find({
      organisationUniqueId: organisationId,
    });

    const employeesWithBirthday = allUsers.filter((user) => {
      const userDay = user.dateOfBirth.getDate();
      const userMonth = user.dateOfBirth.getMonth() + 1;
      return userDay === currentDay && userMonth === currentMonth;
    });

    return res.status(200).json(employeesWithBirthday);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  queryEmployeesBirthdayOnCurrentDay,
};
