import Bullet from "/classes/Bullet.js";

export default class ShooterV1 {
  #ws = undefined;

  currentWeapon = ["guns", "pistol"];

  weapons = {
    guns: {
      pistol: {
        name: "Pistol",
        damage: 20,
        damageHeadshot: 120,
        fireRate: 0.5,
        bulletSpeed: 500,
        bulletSize: 5,
        bulletColor: "black",
        bulletRange: 400,
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
      },
    },
  };

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;
  }

  handleMessage(message) {
    console.log(message);
  }

  predictMovement(secondsPassed) {}

  shoot(angle, centerPlayerWorld) {
    const canvas = this.controller.gameController.canvas;
    const timeStamp = this.controller.gameController.milisecondsServerStart;
    const weapon = this.weapons[this.currentWeapon[0]][this.currentWeapon[1]];
    const origin = [
      centerPlayerWorld[0] -
        this.controller.player.position.x -
        this.controller.player.position.w / 2 +
        canvas.el.width / 2,
      centerPlayerWorld[1] -
        this.controller.player.position.y -
        this.controller.player.position.h / 2 +
        canvas.el.height / 2,
    ];
    const bullet = new Bullet(timeStamp, angle, origin, weapon);
    this.controller.sendJSON({
      type: "gameevt",
      event: {
        type: "game",
        subType: "shot",
        data: bullet.info,
      },
    });
    bullet.draw(canvas);
  }

  handleClick(e) {
    const centerPlayerWorld = [
      this.controller.player.position.x + this.controller.player.position.w / 2,
      this.controller.player.position.y + this.controller.player.position.h / 2,
    ];
    const clickedWorld = [
      window.innerWidth / 2 - e.clientX + centerPlayerWorld[0],
      window.innerHeight / 2 - e.clientY + centerPlayerWorld[1],
    ];
    const angle = Math.atan2(
      clickedWorld[0] - centerPlayerWorld[0],
      clickedWorld[1] - centerPlayerWorld[1]
    );
    this.shoot(angle, centerPlayerWorld);
  }

  tick() {}
}
