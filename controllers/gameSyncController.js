const clients = require("../state/clients.js");
const UserError = require("../utils/UserError.js");

exports.handleSyncPosition = (data, uuid) => {
  // all based on room!
  if (data.data.length !== 5)
    throw new UserError("Position data format invalid");

  clients.broadcast(
    {
      type: "pPos",
      data: message.data,
    },
    uuid
  );
};

exports.handleSyncCam = (data, uuid) => {
  // all based on room!
  if (data.data.length !== 5)
    throw new UserError("Position data format invalid");

  clients.broadcast(
    {
      type: "pPos",
      data: message.data,
    },
    uuid
  );
};
