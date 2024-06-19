const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: "https://master--jocular-fairy-66a01a.netlify.app/", credentials: true }));
app.use(bodyParser.json());
app.use("/api/", routes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Exiting application due to database connection error:", err);
    process.exit(1);
  });
