module.exports = class Ball {
  playerMass = 50;
  mass = 0.5;

  lastContact = undefined;

  constructor(position, velocity, texture) {
    this.x = position.x;
    this.y = position.y;
    this.r = position.r;
    this.velocity = velocity;
    this.texture = texture;
  }

  updatePosition(position) {
    console.log(position);
  }

  impact(playerPos, playerVel, playerId) {
    const colliding = this.rectangleCollision(playerPos);
    if (!colliding) return;

    const momentumXPlayer = Number(this.playerMass * playerVel.x);
    this.velocity.x = momentumXPlayer / this.mass;

    const momentumYPlayer = Number(this.playerMass * playerVel.y);
    this.velocity.y = momentumYPlayer / this.mass;

    this.lastContact = playerId;
  }

  rectangleCollision(rectangle) {
    // if either x distance of y distance to
    // between center of circle and nearest side
    // of rectangle < radius of circle, intersection

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

  slowDown() {
    // this.ball.velocity.x =
    //   Math.sign(this.ball.velocity.x) *
    //   Math.floor(Math.abs((79 * this.ball.velocity.x) / 80));
    // this.ball.velocity.y =
    //   Math.sign(this.ball.velocity.y) *
    //   Math.floor(Math.abs((79 * this.ball.velocity.y) / 80));

    this.velocity.x *= 0.97;
    this.velocity.y *= 0.97;
  }

  reset() {
    this.x = -30;
    this.y = -30;
    this.r = 30;
    this.velocity.x = 0;
    this.velocity.y = 0;
  }
};
