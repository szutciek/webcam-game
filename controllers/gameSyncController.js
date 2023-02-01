const clients = require("../state/clients.js");
const UserError = require("../utils/UserError.js");

exports.handleSyncPosition = (data, client, ws) => {
  if (!client.roomRef) throw new UserError("Position data format invalid");

  if (data.data.length !== 4) {
    throw new UserError("Position data format invalid");
  }

  for (let i = 3; i >= 0; i--) {
    if (typeof data.data[i] !== "number") {
      throw new UserError("Position data format invalid");
    }
  }

  // perform some position validation
  client.roomRef.updatePlayerPosition(ws.uuid, data);

  client.roomRef.broadcast(
    {
      type: "pinf",
      uuid: ws.uuid,
      data: [...data.data],
    },
    ws.uuid
  );
};

exports.handleSyncCam = (data, ws, uuid) => {
  // all based on room!
  console.log(data);

  // clients.broadcast(
  //   {
  //     type: "pPos",
  //     player: uuid,
  //     data: message.data,
  //   },
  //   uuid
  // );
};
