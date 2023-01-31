const rooms = require("../state/rooms");

exports.handleRoomJoin = (message, ws, client) => {
  const room = rooms.find(message.room) || rooms.addRoom(message.room);

  room.joinRoom(message.uuid);
  client.changeRoom(message.room);

  ws.send(
    JSON.stringify({
      type: "roomjoinOk",
      room: message.room,
      data: {
        position: [
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 100),
        ],
      },
    })
  );
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
