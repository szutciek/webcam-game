const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const UserError = require("../utils/UserError.js");
const { choose } = require("../utils/functions.js");
const {
  validateManyCharacters,
  validateEmail,
  validateCharacters,
  rgbMap,
} = require("../utils/validators.js");
const User = require("../models/User.js");
const Authentication = require("../classes/Authentication.js");

const {
  findAvalibleMaps,
  loadMap,
} = require("../controllers/gameMapController.js");

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
      user: {
        token,
        ...choose(user, ["email", "username", "profile", "panelColor"]),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    let ok = true;
    let errors = [];

    if (req.body.username === undefined || req.body.username.length === 0) {
      ok = false;
      errors.push({
        field: "username",
        message: "Required",
      });
    } else if (!validateCharacters(req.body.username)) {
      ok = false;
      errors.push({
        field: "username",
        message: "The provided username is not valid",
      });
    }

    if (req.body.panelColor == undefined || req.body.panelColor.length === 0) {
      ok = false;
      errors.push({
        field: "panelColor",
        message: "Required",
      });
    } else {
      const pC = req.body.panelColor;
      if (typeof pC !== "string" || !pC.startsWith("#") || pC.length !== 7) {
        ok = false;
        errors.push({
          field: "panelColor",
          message: "Panel Color is invalid",
        });
      }

      const [r, g, b] = [pC[1] + pC[2], pC[3] + pC[4], pC[5] + pC[6]];
      const [rSum, gSum, bSum] = [
        r[0] * 16 + rgbMap(r[1]),
        g[0] * 16 + rgbMap(g[1]),
        b[0] * 16 + rgbMap(b[1]),
      ];
      if (rSum < 50 && gSum < 50 && bSum < 50) {
        ok = false;
        errors.push({
          field: "panelColor",
          message: "Panel Color is too dark (min 50)",
        });
      }
      if (rSum > 245 && gSum > 245 && bSum > 245) {
        ok = false;
        errors.push({
          field: "panelColor",
          message: "Panel Color is too light (max 245)",
        });
      }
    }

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

    if (
      req.body.passwordRepeat == undefined ||
      req.body.passwordRepeat.length === 0
    ) {
      ok = false;
      errors.push({
        field: "passwordRepeat",
        message: "Required",
      });
    } else if (!validateManyCharacters(req.body.passwordRepeat)) {
      ok = false;
      errors.push({
        field: "passwordRepeat",
        message: "Password includes invalid characters",
      });
    } else if (req.body.password !== req.body.passwordRepeat) {
      ok = false;
      errors.push({
        field: "passwordRepeat",
        message: "Passwords don't match",
      });
    }

    if (ok !== true) {
      throw new UserError("Bad request", 400, {
        fields: errors,
      });
    }

    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      panelColor: req.body.panelColor,
      password: crypto.randomUUID(),
    });

    user.setPassword(req.body.password);
    await user.save();

    const token = Authentication.encodeToken(user._id);

    res.status(200).json({
      status: "success",
      message: "User created",
      user: {
        token,
        ...choose(user, ["email", "username", "profile", "panelColor"]),
      },
    });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      next(
        new UserError(
          `Couldn't validate ${Object.keys(err.errors).join(", ")}`,
          400
        )
      );
    } else if (err.code === 11000) {
      let duplicates = [];
      Object.entries(err.keyValue).forEach(([key, value]) => {
        duplicates.push({
          field: key,
          message: `${value} is already being used by someone else`,
        });
      });
      next(
        new UserError("Bad request", 400, {
          fields: duplicates,
        })
      );
    } else {
      next(err);
    }
  }
});
router.get("/maps", async (req, res, next) => {
  try {
    const availibleMaps = await findAvalibleMaps();
    const promises = availibleMaps.map(async (name) =>
      JSON.parse(await loadMap(name.split(".")[0]))
    );
    const maps = await Promise.all(promises);

    res.status(200).json({
      status: "success",
      message: "Maps recieved",
      data: maps.map((map) => choose(map, ["displayName", "preview"])),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
