const rooms = require("../state/rooms");
const UserError = require("../utils/UserError");
const { loadMap, findAvalibleMaps } = require("./gameMapController");

exports.handleRoomJoin = async (message, ws, client) => {
  try {
    let room = rooms.find(message.room);

    if (!room) {
      const avalibleMaps = await findAvalibleMaps();

      let mapName;
      if (
        avalibleMaps.includes(`${message.map}.json`) &&
        message.room !== "default"
      ) {
        mapName = message.map;
      } else {
        mapName = "default";
      }

      room = rooms.addRoom(
        message.room || "default",
        mapName,
        client.user._id,
        20
      );

      const map = await loadMap(room.map);
      if (!map) throw new UserError("Map couldn't be loaded", 404);
      const data = JSON.parse(map);

      // data.objects.forEach((obj, i) => {
      //   setTimeout(() => {
      //     room.addObject(obj.coords, { type: "color", value: "aqua" });
      //     setTimeout(() => {
      //       room.updateObject(obj.coords, obj.texture, obj.ignore);
      //     }, 30);
      //   }, i * 20);
      // });

      room.setSpawnPoints(data.spawnPoints);

      data.objects.forEach((obj) => {
        room.addObject(obj.coords, obj.texture, {
          colliding: obj.colliding,
          dynamic: obj.dynamic,
          shape: obj.shape,
        });
      });
    }

    if (!room.checkSpaceAvalible()) {
      throw new UserError(`Room ${message.room} is currently full`);
    }

    const startPos = room.determineStartPos();
    startPos.w = 100;
    startPos.h = 200;

    room.joinRoom(message.uuid, startPos, client.user.username);
    client.changeRoom(message.room);

    ws.send(
      JSON.stringify({
        type: "roomjoinOk",
        room: message.room,
        data: {
          position: [startPos.x, startPos.y, startPos.w, startPos.h],
        },
      })
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.handleRoomLeave = (message, ws, client) => {
  try {
    // leaves in room and client
    client.leaveRoom(message.room);

    ws?.send(
      JSON.stringify({
        type: "roomleaveOk",
        room: message.room,
      })
    );
  } catch (err) {
    throw err;
  }
};
