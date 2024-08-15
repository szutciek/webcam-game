import Rectangle from "./GameObjects/Rectangle.js";
import Circle from "./GameObjects/Circle.js";
import Player from "./GameObjects/Player.js";

export default class GameObjects {
  #elements = new Map();
  #players = new Map();

  constructor() {
    setInterval(() => {
      this.checkIfPlayersAlive();
    }, 5 * 1000);
  }

  updatePlayer(id, data) {
    const player =
      this.#players.get(id) ||
      new Player(
        {
          x: data.position[0],
          y: data.position[1],
          w: data.position[2],
          h: data.position[3],
        },
        {
          username: data.username,
          camera: data?.camera,
        }
      );

    const secondsPassed = (new Date().getTime() - player.lastUpdate) / 1000;

    player.updatePosition(data.position, secondsPassed);
    player.updateInfo(data);
    if (data.pose) {
      player.updatePose(data.pose);
    }

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
      const item = this.#elements.get(i.id);
      if (item) return item.updateData(i);

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

  predictMovement(secondsPassed) {
    this.#players.forEach((p) => p.predictMovement(secondsPassed));
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
