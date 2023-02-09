const clients = require("../state/clients.js");
const UserError = require("../utils/UserError.js");

exports.handleSyncPosition = (data, client, ws) => {
  if (!client.roomRef || !client.room) throw new UserError("Join a room first");

  if (data.position.length !== 4) {
    throw new UserError("Position data format invalid");
  }

  for (let i = 3; i >= 0; i--) {
    if (typeof data.position[i] !== "number") {
      throw new UserError("Position data format invalid");
    }
  }

  // perform some position validation
  client.roomRef.updatePlayerCalcPosition(ws.uuid, {
    x: data.position[0],
    y: data.position[1],
    w: data.position[2],
    h: data.position[3],
    velX: data.velX,
    velY: data.velY,
  });
  client.roomRef.updatePlayerPose(ws.uuid, data.pose);

  // we send one huge request
  // client.roomRef.broadcast(
  //   {
  //     type: "pinf",
  //     uuid: ws.uuid,
  //     position: [...data.position],
  //     pose: data.pose,
  //   },
  //   ws.uuid
  // );
};

exports.handleSyncPositionAndCamera = (data, client, ws) => {
  if (!client.roomRef || !client.room) throw new UserError("Join a room first");

  if (data.position.length !== 4) {
    throw new UserError("Position data format invalid");
  }

  if (!data.camera) throw new UserError("Camera data not included");

  for (let i = 3; i >= 0; i--) {
    if (typeof data.position[i] !== "number") {
      throw new UserError("Position data format invalid");
    }
  }

  // perform some position validation
  client.roomRef.updatePlayerCalcPosition(ws.uuid, {
    x: data.position[0],
    y: data.position[1],
    w: data.position[2],
    h: data.position[3],
    velX: data.velX,
    velY: data.velY,
  });
  client.roomRef.updatePlayerPose(ws.uuid, data.pose);
  client.roomRef.updatePlayerCamera(ws.uuid, data.camera);

  // we send one huge request
  // client.roomRef.broadcast(
  //   {
  //     type: "pinfcam",
  //     uuid: ws.uuid,
  //     position: [...data.position],
  //     pose: data.pose,
  //     camera: data.camera,
  //   },
  //   ws.uuid
  // );
};

// exports.handleSyncCam = (data, client, ws) => {
//   if (!client.roomRef || !client.room) throw new UserError("Join a room first");

//   if (typeof data.data !== "string")
//     throw new UserError("Camera data should be a string");

//   client.roomRef.updatePlayerCamera(ws.uuid, data.data);

//   client.roomRef.broadcast(
//     {
//       type: "pcam",
//       uuid: ws.uuid,
//       data: data.data,
//     },
//     ws.uuid
//   );
// };
