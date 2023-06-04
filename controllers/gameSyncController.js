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
    throw err;
  }
};

exports.handleSyncCam = (data, client, ws) => {
  try {
    if (!client.roomRef || !client.room)
      throw new UserError("Join a room first");

    if (typeof data.camera !== "string")
      throw new UserError("Camera data should be a string");

    client.roomRef.updatePlayerCamera(ws.uuid, data.camera);
  } catch (err) {
    throw err;
  }
};

exports.handleGameEvent = (data, client) => {
  try {
    if (!client.roomRef || !client.room)
      throw new UserError("Join a room first");

    if (data.event === null || typeof data.event !== "object")
      throw new UserError("Input data type wrong");

    client.roomRef.handleEvent(client.uuid, data.event);
  } catch (err) {
    throw err;
  }
};

exports.handleChatMessage = (data, client) => {
  try {
    client.roomRef.broadcast({
      type: "chatmsg",
      uuid: client.uuid,
      username: client.user.username,
      message: data.message,
    });
  } catch (err) {
    throw err;
  }
};
