import { wsURL } from "/config.js";

export default class ClientController {
  #ws = undefined;

  room = undefined;
  user = undefined;

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
          type: "authClient",
          // change into jwt eventually
          token: this.user.token,
        })
      );
      this.startSync();
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

  startSync() {
    this.#ws.addEventListener("message", (message) => {
      this.handleMessage(message);
    });
    console.log("Listening to messages from the server...");
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

    if (message.type === "error") {
      console.warn(message);
    }
    if (message.type === "authClientOk") {
      this.user.uuid = message.data.uuid;
      console.log(`User assigned UUID ${this.user.uuid}`);
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
