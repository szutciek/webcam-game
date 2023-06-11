const UserError = require("../../../utils/UserError.js");

const GameMode = require("../GameMode.js");
const Bullet = require("./Bullet.js");

module.exports = class Open extends GameMode {
  mode = "shooterV1";

  #playerInventories = new Map();
  #bullets = new Map();

  weapons = {
    pistol: {
      name: "pistol",
      longName: "Pistol",
      damage: 20,
      damageHeadshot: 120,
      fireRate: 0.5,
      bulletSpeed: 200,
      bulletSize: 5,
      bulletColor: "black",
      bulletRange: 400,
      magazineSize: 12,
    },
    ar: {
      name: "ar",
      longName: "Assault Rifle",
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
    try {
      if (data.subType === "shot") {
        return this.handlesShotEvent(player, data);
      }
    } catch (err) {
      throw err;
    }
  }

  handlesShotEvent(player, data) {
    try {
      const playerInventory = this.#playerInventories.get(player.uuid);

      const bullet = new Bullet(
        data.data.uuid,
        player,
        data.data,
        this.weapons[playerInventory.selectedWeapon]
      );
      this.#bullets.set(bullet.uuid, bullet);
      playerInventory.ammo[playerInventory.selectedWeapon] -= 1;

      this.room.broadcast({
        type: "game",
        subType: "newshot",
        data: bullet.broadcastData,
      });

      // throw new UserError("Can't shoot right now...", 400);
    } catch (err) {
      throw err;
    }
  }

  tick() {
    const now = performance.now();
    this.#bullets.forEach((bullet) => {
      const bulletPosition = bullet.currentPosition(now);
      // check collison with players
    });
  }

  get info() {
    return {};
  }

  playerInventory(id) {
    return this.#playerInventories.get(id);
  }
};
