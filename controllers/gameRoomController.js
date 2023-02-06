const rooms = require("../state/rooms");
const UserError = require("../utils/UserError");

exports.handleRoomJoin = (message, ws, client) => {
  try {
    const room =
      rooms.find(message.room) ||
      rooms.addRoom(message.room, client.user?._id, 2);

    if (!room.checkSpaceAvalible()) {
      throw new UserError(`Room ${message.room} is currently full`);
    }

    room.joinRoom(message.uuid);
    client.changeRoom(message.room);

    ws.send(
      JSON.stringify({
        type: "roomjoinOk",
        room: message.room,
        data: {
          position: [
            Math.floor(Math.random() * 500) - 250,
            Math.floor(Math.random() * 500) - 250,
            100,
            200,
          ],
        },
      })
    );

    room.addObject(
      { x: 60, y: 60, w: 200, h: 50 },
      { type: "color", value: "red" }
    );
    setTimeout(() => {
      room.addObject(
        { x: 190, y: 760, w: 200, h: 50 },
        { type: "color", value: "red" }
      );
    }, 2 * 1000);

    // room.findChunksRow("A", 1).forEach((chunk) => {
    //   chunk.createObject({ x: 0, y: 100 }, { type: "color", value: "white" });
    // });
    // room.findChunksRow("A", 1).forEach((chunk) => {
    //   chunk.createObject(
    //     { x: 3100, y: 100 },
    //     { type: "color", value: "white" }
    //   );
    // });
    // room.findChunksRow("A", 1).forEach((chunk) => {
    //   chunk.createObject(
    //     { x: 3100, y: 100 },
    //     { type: "color", value: "white" }
    //   );
    // });
    // console.log(room.findChunksColumn("A", 1));

    // setTimeout(() => {
    //   console.log(room.chunks);
    // }, 100);
  } catch (err) {
    throw err;
  }
};

exports.handleRoomLeave = (message, ws, client) => {
  // leaves in room and client
  client.leaveRoom(message.room);

  ws?.send(
    JSON.stringify({
      type: "roomleaveOk",
      room: message.room,
    })
  );
};
