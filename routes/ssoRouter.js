const express = require("express");
const router = express.Router();

router.get("/auth", (req, res, next) => {
  res.sendFile(__dirname + "/client/pages/sso.html");
});

module.exports = router;
