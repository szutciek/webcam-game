export default class Soccer {
  #ws = undefined;

  lastBallPosition = {
    x: -15,
    y: -15,
  };

  constructor(controller, ws) {
    this.controller = controller;
    this.#ws = ws;
  }

  findBall() {
    this.controller.gameObjects.allObjects.forEach((e) => {
      if (e.class === "soccer_ball") {
        this.ball = e;
        this.ball.rotation = 0;
      }
    });
  }

  tick() {
    if (!this.ball) return this.findBall();

    const diffX = this.ball.x - this.lastBallPosition.x;
    const diffY = this.ball.y - this.lastBallPosition.y;
    const diff = Math.abs(diffX) + Math.abs(diffY);
    this.ball.rotation += (diff / 2) * Math.sign(diffX);

    this.lastBallPosition = { x: this.ball.x, y: this.ball.y };
  }
}
