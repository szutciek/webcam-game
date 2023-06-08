import Bullet from "/classes/Bullet.js";

export default class ShooterV1 {
  #ws = undefined;

  #bullets = new Map();

  currentWeapon = ["pistol"];

  weapons = {
    pistol: {
      name: "pistol",
      longName: "Pistol",
      damage: 20,
      damageHeadshot: 120,
      fireRate: 0.5,
      bulletSpeed: 500,
      bulletSize: 5,
      bulletColor: "red",
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
      bulletColor: "orange",
      bulletRange: 1000,
      magazineSize: 30,
    },
  };

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;
  }

  handleMessage(message) {
    if (message.subType === "newshot") {
      const bullet = new Bullet(
        message.data.timestamp,
        message.data.angle,
        message.data.origin,
        this.weapons[message.data.weapon],
        message.data.uuid
      );
      this.#bullets.set(bullet.uuid, bullet);
    }
  }

  predictMovement(secondsPassed) {}

  shoot(angle, centerPlayerWorld) {
    const canvas = this.controller.gameController.canvas;
    const timeStamp = this.controller.gameController.milisecondsServerStart;
    const weapon = this.weapons[this.currentWeapon];
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
    // const clickedWorld = [
    //   window.innerWidth / 2 - e.clientX + this.centerPlayerWorld[0],
    //   window.innerHeight / 2 - e.clientY + this.centerPlayerWorld[1],
    // ];
    // const angle = Math.atan2(
    //   clickedWorld[0] - centerPlayerWorld[0],
    //   clickedWorld[1] - centerPlayerWorld[1]
    // );
    // this.shoot(angle, centerPlayerWorld);

    const angle = Math.atan2(
      window.innerWidth / 2 - e.clientX,
      window.innerHeight / 2 - e.clientY
    );
    this.shoot(angle, this.centerPlayerWorld);
  }

  handleMouseMove(e) {
    // const clickedWorld = [
    //   window.innerWidth / 2 - e.clientX + this.centerPlayerWorld[0],
    //   window.innerHeight / 2 - e.clientY + this.centerPlayerWorld[1],
    // ];
    // const angle = Math.atan2(
    //   clickedWorld[0] - centerPlayerWorld[0],
    //   clickedWorld[1] - centerPlayerWorld[1]
    // );
    // this.shoot(angle, centerPlayerWorld);

    const angle = Math.atan2(
      window.innerWidth / 2 - e.clientX,
      window.innerHeight / 2 - e.clientY
    );
    this.shoot(angle, this.centerPlayerWorld);
  }

  handleMouseMove(e) {
    const angle = Math.atan2(
      window.innerWidth / 2 - e.clientX,
      window.innerHeight / 2 - e.clientY,
      window.innerWidth / 2 - e.clientX,
      window.innerHeight / 2 - e.clientY
    );
    this.facingAngle = angle;
  }

  tick() {
    this.#bullets.forEach((bullet) => {
      const timeSinceStart = bullet.timeSinceShot(
        this.controller.gameController.milisecondsServerStart
      );
      const duration = bullet.weapon.bulletRange / bullet.weapon.bulletSpeed;
      if (timeSinceStart / 1000 > duration) {
        this.#bullets.delete(bullet.uuid);
        return;
      }
      const percentage = timeSinceStart / duration / 1000;

      const translatedOrigin = this.controller.gameController.translateToCanvas(
        bullet.origin
      );
      const translatedFinal = this.controller.gameController.translateToCanvas(
        bullet.final
      );

      bullet.draw(
        this.controller.gameController.canvas,
        translatedOrigin,
        translatedFinal,
        percentage
      );
    });
  }

  cleanUpUI() {}

  get centerPlayerWorld() {
    return [
      this.controller.player.position.x + this.controller.player.position.w / 2,
      this.controller.player.position.y + this.controller.player.position.h / 2,
    ];
  }
}
