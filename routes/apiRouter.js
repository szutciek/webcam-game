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
const {
  sendRecoveryEmail,
  sendVerificationEmail,
} = require("../utils/mailer.js");
const User = require("../models/User.js");
const Authentication = require("../classes/Authentication.js");
const { enforceEmailVerification } = require("../config.js");

const {
  findAvalibleMaps,
  loadMap,
} = require("../controllers/gameMapController.js");
const { rooms } = require("../controllers/gameRoomController.js");

router.use(express.json());

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

    const user = await User.findOne({ email: req.body.email }).select([
      "+password",
      "+verifiedEmail",
      "+emailVerificationCode",
    ]);

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

    if (enforceEmailVerification === true && user.verifiedEmail !== true) {
      throw new UserError("Verify your email before logging in", 401, {
        fields: [
          {
            field: "email",
            message:
              "Click the link in your inbox to confirm ownership of this email",
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
      verifiedEmail: false,
      emailVerificationCode: crypto.randomUUID(),
    });

    user.setPassword(req.body.password);
    await user.save();

    await sendVerificationEmail(user);

    if (enforceEmailVerification !== true) {
      const token = Authentication.encodeToken(user._id);

      res.status(200).json({
        status: "success",
        message: "User created",
        enforceEmailVerification: false,
        user: {
          token,
          ...choose(user, ["email", "username", "profile", "panelColor"]),
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "User created",
        displayMessage: "Please verify your email via the link in your inbox",
        enforceEmailVerification: true,
        user: {
          token: null,
          ...choose(user, ["email", "username", "profile", "panelColor"]),
        },
      });
    }
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

router.post("/initiate-password-reset", async (req, res, next) => {
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

    if (ok !== true) {
      throw new UserError("Bad request", 400, {
        fields: errors,
      });
    }

    const user = await User.findOne({ email: req.body.email }).select([
      "+passwordChangeCode",
      "+passwordChangeCodeExpiration",
    ]);

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

    if (new Date(user.passwordChangeCodeExpiration).getTime() > Date.now()) {
      throw new UserError(
        `Password reset already initiated. Check your inbox for a link valid until ${new Date(
          user.passwordChangeCodeExpiration
        )}`
      );
    }

    const resetPasswordCode = crypto.randomUUID();
    user.passwordChangeCode = resetPasswordCode;
    const resetPasswordCodeExpiration = new Date(Date.now() + 5 * 60 * 1000);
    user.passwordChangeCodeExpiration = resetPasswordCodeExpiration;
    await user.save();

    await sendRecoveryEmail(user);

    res.status(200).json({
      status: "success",
      message: "Password reset initiated",
      displayMessage: "The reset link should arrive in your inbox",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/complete-password-reset", async (req, res, next) => {
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

    if (req.body.password === undefined || req.body.password.length === 0) {
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

    if (req.body.code === undefined || req.body.code.length === 0) {
      ok = false;
      errors.push({
        field: "code",
        message: "Required",
      });
    } else if (!validateManyCharacters(req.body.code)) {
      ok = false;
      errors.push({
        field: "code",
        message: "Code includes invalid characters",
      });
    }

    if (ok !== true) {
      throw new UserError("Bad request", 400, {
        fields: errors,
      });
    }

    const user = await User.findOne({ email: req.body.email }).select([
      "+passwordChangeCode",
      "+passwordChangeCodeExpiration",
    ]);

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

    if (!user.passwordChangeCode) {
      user.emailVerificationCode = crypto.randomUUID();
      await user.save();

      sendVerificationEmail(user);

      throw new UserError(
        `You received a new link in your inbox. Please try again using it.`
      );
    }

    if (new Date(user.passwordChangeCodeExpiration).getTime() < Date.now()) {
      throw new UserError(`Password reset code expired. Please try again.`);
    }

    if (user.passwordChangeCode !== req.body.code) {
      throw new UserError(`The provided code is not valid. Please try again.`);
    }

    user.setPassword(req.body.password);
    await user.save();

    user.passwordChangeCode = "";
    user.passwordChangeCodeExpiration = new Date();
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset completed",
      displayMessage: "You can now log in with your new password",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/verify-email", async (req, res, next) => {
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

    if (req.body.code === undefined || req.body.code.length === 0) {
      ok = false;
      errors.push({
        field: "code",
        message: "Required",
      });
    } else if (!validateManyCharacters(req.body.code)) {
      ok = false;
      errors.push({
        field: "code",
        message: "Code includes invalid characters",
      });
    }

    if (ok !== true) {
      throw new UserError("Bad request", 400, {
        fields: errors,
      });
    }

    const user = await User.findOne({ email: req.body.email }).select([
      "+verifiedEmail",
      "+emailVerificationCode",
    ]);

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

    if (user.verifiedEmail === true) {
      return new UserError(
        `This email has already been verified. You can log in.`
      );
    }

    if (user.emailVerificationCode !== req.body.code) {
      throw new UserError(`The provided code is not valid. Please try again.`);
    }

    user.verifiedEmail = true;
    user.emailVerificationCode = "";
    await user.save();

    const token = Authentication.encodeToken(user._id);

    res.status(200).json({
      status: "success",
      message: "Email verification complete",
      user: {
        token,
        ...choose(user, ["email", "username", "profile", "panelColor"]),
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
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
      data: maps.map((map) =>
        choose(map, ["name", "displayName", "preview", "displayGameMode"])
      ),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/rooms", async (req, res, next) => {
  try {
    const roomData = rooms.publicRoomData();
    res.status(200).json({
      status: "success",
      message: "Rooms recieved",
      data: roomData,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
