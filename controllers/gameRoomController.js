const rooms = require("../state/rooms");

exports.handleRoomJoin = (message, ws, client) => {
  const room = rooms.find(message.room) || rooms.addRoom(message.room);

  room.joinRoom(message.uuid);
  client.changeRoom(message.room);
};

exports.handleRoomLeave = (message, ws, client) => {
  const room = rooms.find(message.room) || rooms.addRoom(message.room);

  room.joinRoom(message.uuid);
  client.changeRoom(message.room);
};
