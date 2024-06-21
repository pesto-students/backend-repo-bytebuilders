const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// Path to the SSL certificate and key files
const sslOptions = {
  key: fs.readFileSync('/etc/ssl/private/apache-selfsigned.key'),
  cert: fs.readFileSync('/etc/ssl/certs/apache-selfsigned.crt')
};

app.use(cors({ origin: "https://master--jocular-fairy-66a01a.netlify.app/", credentials: true }));
app.use(bodyParser.json());
app.use("/api/", routes);

connectDB()
  .then(() => {
    // Create HTTPS server
    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`HTTPS Server is running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Exiting application due to database connection error:", err);
    process.exit(1);
  });
