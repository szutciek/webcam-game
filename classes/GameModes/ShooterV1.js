const GameMode = require("./GameMode.js");

module.exports = class Open extends GameMode {
  mode = "shooterV1";

  #playerInventories = new Map();
  #bullets = new Map();

  weapons = {
    pistol: {
      name: "Pistol",
      damage: 20,
      damageHeadshot: 120,
      fireRate: 0.5,
      bulletSpeed: 500,
      bulletSize: 5,
      bulletColor: "black",
      bulletRange: 400,
      magazineSize: 12,
    },
    ar: {
      name: "Assault Rifle",
      damage: 50,
      damageHeadshot: 200,
      fireRate: 0.1,
      bulletSpeed: 800,
      bulletSize: 7,
      bulletColor: "red",
      bulletRange: 1000,
      magazineSize: 30,
    },
  };

  constructor(host, room) {
    super(host, room);
  }

  playerJoin(player) {
    this.#playerInventories.set(player.uuid, {
      weapons: ["pistol", "ar"],
      ammo: {
        pistol: 60,
        ar: 150,
      },
      selectedWeapon: "pistol",
    });
  }

  playerLeave(player) {
    this.#playerInventories.delete(player.uuid);
  }

  handleEvent(player, data) {
    const origin = [
      player.position.x + player.position.w / 2,
      player.position.y + player.position.h / 2,
    ];

    const playerInventory = this.#playerInventories.get(player.uuid);

    console.log(
      `Bullet shot by player ${player.username} from ${origin[0]}, ${origin[1]} at angle ${data.data.angle}rad using weapon ${playerInventory.selectedWeapon}`
    );
  }

  tick() {}

  get info() {
    return {};
  }

  playerInventory(id) {
    return this.#playerInventories.get(id);
  }
};
