export default class Ball {
  playerMass = 50;
  mass = 0.5;

  rotation = 0;
  velocities = { x: 0, y: 0 };
  texture = {
    type: "graphic",
    value: "https://assets.kanapka.eu/images/ball.png",
  };

  constructor(gameModeController, position) {
    this.gameModeController = gameModeController;
    this.x = position.x;
    this.y = position.y;
    this.r = position.r;

    this.texture.image = new Image();
    this.texture.image.src = this.texture.value;
  }

  impact(playerPos, playerVel) {
    const colliding = this.rectangleCollision(playerPos);
    if (!colliding) return;

    const momentumXPlayer = Number(this.playerMass * playerVel.x);
    this.velocities.x = momentumXPlayer / this.mass;

    const momentumYPlayer = Number(this.playerMass * playerVel.y);
    this.velocities.y = momentumYPlayer / this.mass;
  }

  rectangleCollision(rectangle) {
    const intXLeft = Math.abs(this.x + this.r - rectangle.x) < this.r;
    const intXRight =
      Math.abs(rectangle.x + rectangle.w - this.x - this.r) < this.r;
    const intXMiddle =
      rectangle.x < this.x && rectangle.x + rectangle.w > this.x + this.r;

    const intYTop = Math.abs(this.y + this.r - rectangle.y) < this.r;
    const intYBottom =
      Math.abs(rectangle.y + rectangle.h - this.y - this.r) < this.r;
    const intYMiddle =
      rectangle.y < this.y && rectangle.y + rectangle.h > this.y + this.r;

    return (
      (intXLeft || intXMiddle || intXRight) &&
      (intYTop || intYMiddle || intYBottom)
    );
  }

  predictMovement(secondsPassed, milisecondsServerStart) {
    const player = this.gameModeController.controller.gC.player;
    if (!this.rectangleCollision(player.position)) {
      const diffX = this.velocities.x * secondsPassed * 0.98;
      const diffY = this.velocities.y * secondsPassed * 0.98;
      this.x += diffX;
      this.y += diffY;
    } else {
      this.impact(player.position, player.velocities);
    }
  }

  calcRotation() {
    this.rotation += this.velocities.x / 20;
    return this.rotation;
  }

  get renderInfo() {
    // for canvas drawItem method
    const pos =
      this.gameModeController.controller.gC.translateCircleInView(this);
    const rotation = this.calcRotation();
    return {
      x: pos.x,
      y: pos.y,
      r: pos.r,
      rotation: rotation,
      shape: "circ",
      texture: this.texture,
    };
  }
}
