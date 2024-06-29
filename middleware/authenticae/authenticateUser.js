const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization failed. No access token." });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      // console.log(err);
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token expired. Please log in again." });
      } else {
        // console.log("err.name)
        return res.status(403).json({ message: "Could not verify token" });
      }
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateUser;
