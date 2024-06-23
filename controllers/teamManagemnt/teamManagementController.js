const Team = require("../../models/teamModel");
const User = require("../../models/userModel");
const getUserById = require("../../utils/getUserController");

// Create a team
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await getUserById(req.user._id);

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    if (!user.isAdmin && !user.isReportingManager) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const reportingManager = user;
    const orgId = user.organisationUniqueId;

    const team = new Team({
      name,
      organizationId: orgId,
      reportingManager: reportingManager._id,
    });

    team.members.push(reportingManager._id);

    await team.save();

    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    if (error.code === 11000) {
      // This code handles the duplicate key error
      res.status(400).json({ message: "A team with this name already exists in the organization." });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

const addMembersToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { memberIds } = req.body;
    const user = await getUserById(req.user._id);

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    if (!user.isAdmin && !user.isReportingManager) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const members = await User.find({
      _id: { $in: memberIds },
      isEmployeeActive: true,
    });

    if (members.length !== memberIds.length) {
      return res.status(400).json({
        message: "Some members are not part of the company, kindly check",
      });
    }

    team.members.push(...members.map(m => m._id));
    await team.save();

    const membersDetails = await User.find({
      _id: { $in: memberIds },
    }).select("-password");

    res.json({
      message: "Members added successfully",
      team,
      teamLeader: user,
      membersDetails,
    });
  } catch (error) {
    console.error("Error adding members to team:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Remove members from a team
const removeMembersFromTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { memberIds } = req.body;
    const user = await getUserById(req.user._id);

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    if (!user.isAdmin && !user.isReportingManager) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.members = team.members.filter(
      member => !memberIds.includes(member.toString())
    );
    await team.save();

    const remainingMembersDetails = await User.find({
      _id: { $in: team.members },
    }).select("-password");

    res.json({
      message: "Members removed successfully",
      team,
      remainingMembersDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update team name
const updateTeamName = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;
    const user = await getUserById(req.user._id);

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    if (!user.isAdmin && !user.isReportingManager) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const team = await Team.findByIdAndUpdate(teamId, { name }, { new: true });
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json({ message: "Team name updated successfully", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete team
const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const user = await getUserById(req.user._id);

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    if (!user.isAdmin && !user.isReportingManager) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const team = await Team.findByIdAndDelete(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getAllTeams = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    const userOrganisationId = user.organisationUniqueId;
    const teams = await Team.find({ organizationId: userOrganisationId }, { name: 1, organizationId: 1 });

    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get particular team details
const getParticularTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    const user = await getUserById(req.user._id);

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const teamName = team.name;
    const teamReportingManager = team.reportingManager;
    const teamMembers = team.members;
    const team_id = team.id;

    const managerDetails = await User.findById(teamReportingManager).select("-password");
    const membersDetails = await User.find({ _id: { $in: teamMembers } }).select("-password");

    res.json({
      team_id,
      teamName,
      teamReportingManager: managerDetails,
      teamMembers: membersDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const fetchYourOwnTeam = async (req, res) => {
  try {
    const user = await getUserById(req.user._id);

    if (!user.isEmployeeActive) {
      return res.status(403).json({ message: "Unauthorized. Inactive user." });
    }

    const teams = await Team.find({ members: user._id });
    const teamDetails = [];

    for (const team of teams) {
      const teamId = team.id;
      const teamName = team.name;
      const teamReportingManager = team.reportingManager;
      const teamMembers = team.members;

      const managerDetails = await User.findById(teamReportingManager).select("-password");
      const membersDetails = await User.find({ _id: { $in: teamMembers } }).select("-password");

      teamDetails.push({
        teamId,
        teamName,
        teamReportingManager: managerDetails,
        teamMembers: membersDetails,
      });
    }

    res.json({ teamDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createTeam,
  addMembersToTeam,
  removeMembersFromTeam,
  updateTeamName,
  deleteTeam,
  getAllTeams,
  getParticularTeamDetails,
  fetchYourOwnTeam,
};
