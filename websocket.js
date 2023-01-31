const { randomUUID } = require("crypto");
const { WebSocketServer: WSS, WebSocket: ws } = require("ws");

const objects = require("./gameObjects");

const wss = new WSS({ port: 5501 });

wss.on("connection", function connection(ws) {
  ws.send(
    JSON.stringify({
      type: "auth",
      data: {
        id: randomUUID(),
      },
    })
  );
  ws.send(
    JSON.stringify({
      type: "obj",
      data: objects,
    })
  );

  ws.on("message", function message(data) {
    const message = JSON.parse(data);
    if (message.type === "pos") {
      if (message.data.length !== 5) return;
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(
            JSON.stringify({
              type: "pPos",
              data: message.data,
            })
          );
        }
      });
    }
    if (message.type === "cam") {
      if (!message.player) return;
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(
            JSON.stringify({
              type: "pCam",
              player: message.player,
              data: message.data,
            })
          );
        }
      });
    }
  });
});
