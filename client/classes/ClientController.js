import { wsURL } from "/config.js";
import Player from "/classes/Player.js";
import GameObjects from "/classes/GameObjects.js";
import GameController from "/classes/GameController.js";

export default class ClientController {
  #ws = undefined;

  room = undefined;
  user = undefined;

  gameController = undefined;
  gameObjects = undefined;
  player = undefined;

  constructor(user) {
    if (!user) throw new Error("User required to run client");
    this.user = user;
  }

  changeRoom(room) {
    if (!room) return;
    console.log(`Changing room to ${room}`);
    this.room = room;
    // tell server about change
    return true;
  }

  connectServer() {
    return new Promise((resolve, reject) => {
      this.#ws = new WebSocket(wsURL);
      this.#ws.addEventListener("open", () => {
        // remove event listeners
        resolve();
      });
      this.#ws.addEventListener("error", () => {
        // remove event listeners
        reject();
      });
    });
  }

  async startGame() {
    try {
      if (!this.room) return;
      console.log("Connecting to server...");
      await this.connectServer();
      console.log(`Successfully connected to ${wsURL}`);
      console.log(`Sending ${this.user.username}'s token to authenticate`);
      this.#ws.send(
        JSON.stringify({
          type: "authclient",
          // change into jwt eventually
          token: this.user.token,
        })
      );
      this.startListen();
      await this.waitForUUID();
      console.log(`Joining room ${this.room}`);
      this.joinRoom();
    } catch (err) {
      console.log(err);
    }
  }

  joinRoom() {
    if (!this.user.uuid || !this.room) return;
    this.#ws.send(
      JSON.stringify({
        type: "roomjoin",
        uuid: this.user.uuid,
        room: this.room,
      })
    );
  }

  startListen() {
    this.#ws.addEventListener("message", (message) => {
      this.handleMessage(message);
    });
    console.log("Listening to messages from the server...");
  }
  stopListen() {
    this.#ws.removeEventListener("message", (message) => {
      this.handleMessage(message);
    });
    console.log("No longer listening to server...");
  }

  startRender() {
    this.gameObjects = new GameObjects();
    this.gameController = new GameController(
      this.player,
      this.#ws,
      this.user.uuid,
      this.gameObjects
    );
    this.gameController.startGame();
  }

  stopRender() {
    this.gameController = undefined;
    this.player = undefined;
  }

  sendJSON(payload) {
    this.#ws.send(JSON.stringify(payload));
  }

  handleMessage(mes) {
    const message = JSON.parse(mes.data);
    if (message.type === "pinf") {
      const [x, y, w, h] = message.data;
      if (!message.uuid) return;
      this.gameObjects.updatePlayerInfo(message.uuid, { x, y, w, h });
      return;
    }

    if (message.type === "pcam") {
      if (!message.uuid) return;
      // add convert script to this
      this.gameObjects.updatePlayerCamera(message.uuid, message.data);
    }

    if (message.type === "mobj") {
      this.gameObjects.setObjects(message.data);
    }

    if (message.type === "error") {
      console.warn(message);
      return;
    }
    if (message.type === "authclientOk") {
      this.user.uuid = message.data.uuid;
      console.log(`User assigned UUID ${this.user.uuid}`);
      return;
    }
    if (message.type === "roomjoinOk") {
      console.log(`Successfully joined room ${this.room}`);
      this.player = new Player([
        message?.data?.position[0],
        message?.data?.position[1],
        message?.data?.position[2],
        message?.data?.position[3],
      ]);
      this.startRender();
      return;
    }
  }

  async waitForUUID() {
    return new Promise((resolve, reject) => {
      const checker = setInterval(() => {
        if (this.user.uuid) {
          clearInterval(checker);
          resolve();
        }
        // reject if some time passes
      }, 50);
    });
  }
}
