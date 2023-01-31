import { wsURL } from "/config.js";

export default class ClientController {
  #ws = undefined;

  room = undefined;
  user = undefined;

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
      this.#ws.send(
        JSON.stringify({
          type: "authClient",
          // change into jwt eventually
          token: this.user.token,
        })
      );
      console.log(`Sending ${this.user.username}'s token to authenticate`);
      this.startSync();
      console.log("Listening to messages from the server...");
    } catch (err) {
      console.log(err);
    }
  }

  startSync() {
    this.#ws.addEventListener("message", this.handleMessage);
  }
  stopSync() {
    this.#ws.removeEventListener("message");
  }

  handleMessage(mes) {
    const message = JSON.parse(mes.data);
    // if (message.type === "pPos") {
    //   const [id, x, y, w, h] = message.data;
    //   gameObjects.updatePlayer(id, { x, y, w, h, fc: "red" });
    // }
    // if (message.type === "pCam") {
    //   gameObjects.updatePlayerCamera(message.player, message.data);
    // }
    // if (message.type === "obj") {
    //   gameObjects.allObjects = message.data;
    // }
    console.log(message);
    if (message.type === "authClientOk") {
      console.log(message.data);
      this.user.uuid = message.data.uuid;
    }
    if (message.type === "error") {
      console.warn(message);
    }
  }
}
