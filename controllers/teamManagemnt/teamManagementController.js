const Team = require("../../models/teamModel");
const User = require("../../models/userModel");
const getUserById = require("../../utils/getUserController");

// Create a team
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await getUserById(req.user._id);

    // Check if the user is authorized
    if (!user.isAdmin && !user.isReportingManager) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Assign the user creating the team as the reporting manager
    const reportingManager = user;
    const orgId = user.organisationUniqueId;

    // Create a new team instance
    const team = new Team({
      name,
      organizationId: orgId,
      reportingManager: reportingManager._id, // Saving the reporting manager's ID
    });

    // Add reporting manager to team members
    team.members.push(reportingManager._id);

    // Save the team
    await team.save();

    res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMembersToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { memberIds } = req.body;
    const user = await getUserById(req.user._id);
    const teamLeader = user;

    // Check if the user is authorized
    if (!user.isAdmin && !user.isReportingManager) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Find active members only
    const members = await User.find({
      _id: { $in: memberIds },
      isEmployeeActive: true, // Only include active employees
    });

    if (members.length !== memberIds.length) {
      return res.status(400).json({
        message: "Some members are not part of the company, kindly check",
      });
    }

    team.members.push(...members);
    await team.save();

    // Fetch userDetails for each member (excluding password)
    const membersDetails = await User.find({
      _id: { $in: memberIds },
    }).select("-password");

    res.json({
      message: "Members added successfully",
      team,
      teamLeader,
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

    // Check if the user is authorized
    if (!user.isAdmin || !user.isReportingManager) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Remove members from the team
    team.members = team.members.filter(
      (member) => !memberIds.includes(member.toString())
    );
    await team.save();

    // Fetch userDetails for each remaining member
    const remainingMembersDetails = [];
    for (const memberId of team.members) {
      const memberDetails = await User.findById(memberId);
      remainingMembersDetails.push(memberDetails);
    }

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
    // Check if the user is authorized
    if (!user.isAdmin || !user.isReportingManager) {
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
    // Check if the user is authorized

    const user = await getUserById(req.user._id);
    // Check if the user is authorized
    if (!user.isAdmin || !user.isReportingManager) {
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
    const userOrganisationId = user.organisationUniqueId;

    // Check if the user is authorized
    if (!user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Find all teams that belong to the same organization as the user
    const teams = await Team.find(
      { organizationId: userOrganisationId },
      { name: 1, organizationId: 1 }
    );

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

    // Check if the user is authorized
    if (!user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Extract team details
    const teamName = team.name;
    const teamReportingManager = team.reportingManager;
    const teamMembers = team.members;
    const team_id = team.id;

    // Fetch reporting manager details, excluding password
    const managerDetails = await User.findById(teamReportingManager).select(
      "-password"
    );

    // Fetch details for each team member, excluding password
    const membersDetails = await User.find({
      _id: { $in: teamMembers },
    }).select("-password");

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

    // Check if the user is authorized
    if (!user) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Find all teams where the user is a member
    const teams = await Team.find({ members: user._id });

    // Extract team details
    const teamDetails = [];
    for (const team of teams) {
      const teamId = team.id;
      const teamName = team.name;
      const teamReportingManager = team.reportingManager;
      const teamMembers = team.members;

      // Fetch reporting manager details, excluding password
      const managerDetails = await User.findById(teamReportingManager).select(
        "-password"
      );

      // Fetch details for each team member, excluding password
      const membersDetails = await User.find({
        _id: { $in: teamMembers },
      }).select("-password");

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
