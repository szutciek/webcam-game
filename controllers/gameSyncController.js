const clients = require("../state/clients.js");
const UserError = require("../utils/UserError.js");

exports.handleSyncPosition = (data, client, ws) => {
  // all based on room!
  console.log(message);
  console.log(client.roomRef);

  if (data.data.length !== 4)
    throw new UserError("Position data format invalid");

  client.roomRef?.broadcast("HOLA");
};

exports.handleSyncCam = (data, ws, uuid) => {
  // all based on room!

  clients.broadcast(
    {
      type: "pPos",
      player: uuid,
      data: message.data,
    },
    uuid
  );
};
