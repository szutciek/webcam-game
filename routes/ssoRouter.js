const express = require("express");
const router = express.Router();

router.get("/auth", (req, res, next) => {
  res.status(200).send("SSO not yet supported");
});

module.exports = router;
