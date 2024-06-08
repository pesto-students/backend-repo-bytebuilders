const UserModel = require("../models/userModel");

async function getUserById(userId) {
    try {
        const user = await UserModel.findById(userId);
        return user;
    } catch (error) {
        console.error("Error while fetching user:", error);
        throw new Error("Failed to fetch user");
    }
}

module.exports = getUserById;
