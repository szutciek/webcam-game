const rooms = require("../state/rooms");
const UserError = require("../utils/UserError");
const { loadMap, findAvalibleMaps } = require("./gameMapController");

exports.handleRoomJoin = async (message, ws, client) => {
  try {
    let room = rooms.find(message.room);

    if (!room) {
      room = rooms.addRoom(message.room, client.user?._id, 20);

      // add option to choose map and create room in a different way later on
      let mapCode = undefined;
      const avalibleMaps = await findAvalibleMaps();
      if (avalibleMaps.includes(`${room.code}.json`)) {
        mapCode = room.code;
      } else {
        mapCode = "default";
      }

      const map = await loadMap(mapCode);
      if (!map) throw new UserError("Map couldn't be loaded", 404);
      const data = JSON.parse(map);

      data.objects.forEach((obj, i) => {
        setTimeout(() => {
          room.addObject(obj.coords, { type: "color", value: "aqua" });
          setTimeout(() => {
            room.updateObject(obj.coords, obj.texture);
          }, 30);
        }, i * 20);
      });
    }

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
