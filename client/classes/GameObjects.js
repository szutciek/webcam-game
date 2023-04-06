import Rectangle from "/classes/GameObjects/Rectangle.js";
import Circle from "/classes/GameObjects/Circle.js";

export default class GameObjects {
  #elements = new Map();
  #players = new Map();

  constructor() {
    setInterval(() => {
      this.checkIfPlayersAlive();
    }, 5 * 1000);
  }

  updatePlayer(id, data) {
    const player = this.#players.get(id) || {};
    player.x = data.position[0];
    player.y = data.position[1];
    player.w = data.position[2];
    player.h = data.position[3];
    player.pose = data.pose;
    if (data.username) player.username = data.username;
    if (data.camera) player.camera = data.camera;
    player.lastUpdate = new Date().getTime();
    this.#players.set(id, player);
  }

  checkIfPlayersAlive() {
    const alive = new Map();
    const now = new Date().getTime();
    this.#players.forEach((value, key) => {
      if (value.lastUpdate - now - 5 > 0) {
        value.lastUpdate = now;
        alive.set(key, value);
      }
    });
    this.#players = alive;
  }

  updateObjects(data) {
    data.forEach((i) => {
      if (i.shape === "rect") {
        this.#elements.set(
          i.id,
          new Rectangle(i.id, { x: i.x, y: i.y, w: i.w, h: i.h }, i.texture, {
            shape: "rect",
            colliding: i.colliding,
            dynamic: i.dynamic,
          })
        );
      } else if (i.shape === "circ") {
        this.#elements.set(
          i.id,
          new Circle(i.id, { x: i.x, y: i.y, r: i.r }, i.texture, {
            shape: "circ",
            colliding: i.colliding,
            dynamic: i.dynamic,
          })
        );
      }
    });
  }

  set allObjects(elements) {
    elements.forEach(([id, e]) => {
      this.#elements.set(id, e);
    });
  }
  set allPlayers(players) {
    players.forEach(([id, e]) => {
      this.#players.set(id, e);
    });
  }

  get allObjects() {
    return this.#elements;
  }
  get allPlayers() {
    return this.#players;
  }
}
