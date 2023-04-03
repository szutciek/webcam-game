const clients = require("../state/clients.js");
const UserError = require("../utils/UserError.js");

exports.handleSyncMovement = (data, client, ws) => {
  try {
    if (!client.roomRef || !client.room)
      throw new UserError("Join a room first");

    if (
      typeof data.position !== "object" ||
      typeof data.velocities !== "object" ||
      typeof data.pose !== "object" ||
      typeof data.relativeTimeStamp !== "number"
    )
      throw new UserError("Bad request", 400);

    client.roomRef.updatePlayerState(ws.uuid, data);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.handleSyncCam = (data, client, ws) => {
  if (!client.roomRef || !client.room) throw new UserError("Join a room first");

  if (typeof data.camera !== "string")
    throw new UserError("Camera data should be a string");

  client.roomRef.updatePlayerCamera(ws.uuid, data.camera);
};
