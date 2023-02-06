const rooms = require("../state/rooms");
const UserError = require("../utils/UserError");

exports.handleRoomJoin = (message, ws, client) => {
  try {
    const room =
      rooms.find(message.room) ||
      rooms.addRoom(message.room, client.user?._id, 20);

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
        { x: -500, y: 250, w: 1000, h: 70 },
        { type: "color", value: "red" }
      );
    }, 1 * 1000);
    setTimeout(() => {
      room.updateObject({ x: -500, y: 250 }, { type: "color", value: "blue" });
    }, 2 * 1000);

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        room.addObject(
          { x: i * 100, y: Math.sin(i) * 40 + 200, w: 100, h: 100 },
          { type: "color", value: `${i % 2 ? "black" : "white"}` }
        );
      }, i * 100);
    }
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
