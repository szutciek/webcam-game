const express = require("express");
const router = express.Router();

const { basePath } = require("../config.js");

router.get("/auth", (req, res, next) => {
  res.sendFile(basePath + "/client/pages/sso.html");
});

module.exports = router;
