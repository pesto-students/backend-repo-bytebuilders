const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const https = require("https");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8000;

// Path to the SSL certificate and key files
const sslOptions = {
  key: fs.readFileSync("/etc/ssl/private/private.key"),
  cert: fs.readFileSync("/etc/ssl/certs/certificate.crt"),
  ca: fs.readFileSync("/etc/ssl/certs/ca_bundle.crt"),
};

// CORS configuration
const allowedOrigins = ["https://master--jocular-fairy-66a01a.netlify.app"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json());
app.use("/api/", routes);

app.get(
  "/.well-known/pki-validation/46013F07675AFEED4447AB700DCA52C0.txt",
  (req, res) => {
    res.sendFile(
      `/home/ubuntu/backend-repo-bytebuilders/46013F07675AFEED4447AB700DCA52C0.txt`,
      (err) => {
        if (err) {
          res.status(500).send("File not found");
        }
      }
    );
  }
);

// Handle preflight requests
app.options(
  "*",
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Connect to the database and start the server
connectDB()
  .then(() => {
    https.createServer(sslOptions, app).listen(PORT, () => {
      // http.createServer(app).listen(PORT, () => {
      console.log(`HTTPS Server is running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Exiting application due to database connection error:", err);
    process.exit(1);
  });
