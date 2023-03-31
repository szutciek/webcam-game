const express = require("express");
const router = express.Router();

const UserError = require("../utils/UserError.js");
const { choose } = require("../utils/functions.js");
const {
  validateManyCharacters,
  validateEmail,
} = require("../utils/validators.js");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config.js");
const Authentication = require("../classes/Authentication.js");

router.post("/login", async (req, res, next) => {
  try {
    let ok = true;
    let errors = [];

    if (req.body.email === undefined || req.body.email.length === 0) {
      ok = false;
      errors.push({
        field: "email",
        message: "Required",
      });
    } else if (!validateEmail(req.body.email)) {
      ok = false;
      errors.push({
        field: "email",
        message: "The provided email is not valid",
      });
    }

    if (req.body.password == undefined || req.body.password.length === 0) {
      ok = false;
      errors.push({
        field: "password",
        message: "Required",
      });
    } else if (!validateManyCharacters(req.body.password)) {
      ok = false;
      errors.push({
        field: "password",
        message: "Password includes invalid characters",
      });
    }

    if (ok !== true) {
      throw new UserError("Bad request", 400, {
        fields: errors,
      });
    }

    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );

    if (!user) {
      throw new UserError("User not found", 404, {
        fields: [
          {
            field: "email",
            message: "Account with this email not found",
          },
        ],
      });
    }

    if (!user.checkPassword(req.body.password)) {
      throw new UserError("Passwords don't match", 401, {
        fields: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      });
    }

    const token = Authentication.encodeToken(user._id);

    res.status(200).json({
      status: "success",
      message: "User signed in",
      user: { token, ...choose(user, ["email", "username", "profile"]) },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/signup", async (req, res, next) => {
  console.log(req.body);
});

module.exports = router;
