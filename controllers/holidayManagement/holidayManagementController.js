const HolidayModel = require("../../models/holidayModel");
const UserModel = require("../../models/userModel");

const getUserById = require("../../utils/getUserController");

const addHoliday = async (req, res) => {
  if (req.method === "POST") {
    try {
      const user = await getUserById(req.user._id);

      const { date, name } = req.body;

      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      const existingHoliday = await HolidayModel.findOne({ date });
      if (existingHoliday) {
        return res
          .status(400)
          .json({ message: "Holiday with this date already exists" });
      }

      const organisationName = user.organisationName;

      const holiday = new HolidayModel({
        date,
        name,
        addedBy: user._id,
        organisation: organisationName,
      });

      await holiday.save();

      return res.status(201).json({ message: "Holiday added successfully" });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
};

const getAllHolidaysByOrganization = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);

    const organisationName = user.organisationName;

    const holidays = await HolidayModel.find({
      organisation: organisationName,
    });

    return res.status(200).json(holidays);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addHoliday,
  getAllHolidaysByOrganization,
};
