export default class Ball {
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

  predictMovement(secondsPassed, milisecondsServerStart) {
    const diffX = this.velocities.x * secondsPassed;
    const diffY = this.velocities.y * secondsPassed;
    this.x += diffX;
    this.y += diffY;
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
