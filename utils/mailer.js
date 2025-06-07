const nodemailer = require("nodemailer");

const config = require("../config");
const UserError = require("../utils/UserError");

const url = config.baseUrl;

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: true,
  auth: {
    user: config.emailUser,
    pass: config.emailPwd,
  },
});

exports.sendRecoveryEmail = async (user) => {
  return new Promise(async (res, rej) => {
    try {
      const recoveryUrl = `${config.baseUrl}/reset?email=${user.email}&code=${user.passwordChangeCode}`;

      const mail = {
        from: config.emailUser,
        subject: "Webcam Game Password Reset",
        to: user.email,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    table {
      border-collapse: collapse;
    }
  </style>
</head>
<body>
  <table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" bgcolor="#ffffff" cellpadding="20" cellspacing="0" style="font-family: Arial, sans-serif; color: #333;">
          <tr>
            <td>
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>You requested to reset your password. Click the button below to set a new password:</p>

              <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                <tr>
                  <td bgcolor="#007BFF" style="border-radius: 5px;">
                    <a href="${recoveryUrl}" target="_blank" style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin-top: 30px;">If you didn’t request this, please ignore this email.</p>
              <p>Thanks,<br>Webcam Game</p>
            </td>
          </tr>
          <tr>
            <td style="font-size: 12px; color: #777; text-align: center;">
              <p>If you're having trouble, copy and paste this link into your browser:</p>
              <p><a href="${recoveryUrl}" style="color: #007BFF;">${recoveryUrl}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      };

      await transporter.sendMail(mail);

      res();
    } catch (err) {
      rej(err);
    }
  });
};

exports.sendVerificationEmail = async (user) => {
  return new Promise(async (res, rej) => {
    try {
      const verificationUrl = `${config.baseUrl}/verify?email=${user.email}&code=${user.emailVerificationCode}`;

      const mail = {
        from: config.emailUser,
        subject: "Webcam Game Email Verification",
        to: user.email,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    table {
      border-collapse: collapse;
    }
  </style>
</head>
<body>
  <table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" bgcolor="#ffffff" cellpadding="20" cellspacing="0" style="font-family: Arial, sans-serif; color: #333;">
          <tr>
            <td>
              <h2>Email Verification Request</h2>
              <p>Hello,</p>
              <p>Thanks for signing up to this revolutionary website. Click the button below to verify your email:</p>

              <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                <tr>
                  <td bgcolor="#007BFF" style="border-radius: 5px;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 12px 20px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify email</a>
                  </td>
                </tr>
              </table>

              <p style="margin-top: 30px;">If you didn’t sign up, please ignore this email.</p>
              <p>Thanks,<br>Webcam Game</p>
            </td>
          </tr>
          <tr>
            <td style="font-size: 12px; color: #777; text-align: center;">
              <p>If you're having trouble, copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}" style="color: #007BFF;">${verificationUrl}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      };

      await transporter.sendMail(mail);

      res();
    } catch (err) {
      rej(err);
    }
  });
};
