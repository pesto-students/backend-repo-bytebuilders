const express = require("express");
const ssl = express.Router();


ssl.get(
    '/.well-known/pki-validation/46013F07675AFEED4447AB700DCA52C0',
    (req, res) => {
      res.sendStatus(200);
      res.sendFile(`/46013F07675AFEED4447AB700DCA52C0.txt`);
    }
  );

  module.exports = ssl;