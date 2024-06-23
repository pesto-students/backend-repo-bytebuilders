const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const http = require('http');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// Path to the SSL certificate and key files
// const sslOptions = {
//   key: fs.readFileSync('/etc/ssl/private/apache-selfsigned.key'),
//   cert: fs.readFileSync('/etc/ssl/certs/apache-selfsigned.crt')
// };

// CORS configuration
const allowedOrigins = ["https://master--jocular-fairy-66a01a.netlify.app"];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use("/api/", routes);
app.use("/",ssl)

// Handle preflight requests
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Connect to the database and start the server
connectDB()
  .then(() => {
    // https.createServer(sslOptions, app).listen(PORT, () => {
      http.createServer(app).listen(PORT, () => {
      console.log(`HTTPS Server is running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Exiting application due to database connection error:", err);
    process.exit(1);
  });
