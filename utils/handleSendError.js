const UserError = require("./UserError.js");

module.exports = (err, ws) => {
  if (!err || !ws) return;
  console.log(err);

  if (err instanceof UserError) sendUserError(err, ws);
  else sendSecretError(ws);
};

const sendUserError = (err, ws) => {
  ws.send(
    JSON.stringify({
      type: "error",
      code: err.code,
      message: err.message,
    })
  );
};

const sendSecretError = (ws) => {
  ws.send(
    JSON.stringify({
      type: "error",
      code: 500,
      message: "Internal Server Error",
    })
  );
};
