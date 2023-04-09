const GameMode = require("./GameMode.js");

module.exports = class Soccer extends GameMode {
  mode = "soccer";

  ballVelocity = {
    x: 0,
    y: 0,
  };

  ballMass = 0.5;
  playerMass = 50;

  lastBallMove = 0;

  ballObstacles = [];

  constructor(host, room) {
    super(host, room);

    this.spawnBall();

    setImmediate(() => {
      this.getObstacles();
    });
  }

  getObstacles() {
    const quadrants = [];
    quadrants.push(this.room.getChunk(-1, 1));
    quadrants.push(this.room.getChunk(1, 1));
    quadrants.push(this.room.getChunk(1, -1));
    quadrants.push(this.room.getChunk(-1, -1));
    const obstacles = [];
    quadrants.forEach((q) => {
      obstacles.push(q.staticObjects);
    });
    return obstacles;
  }

  spawnBall() {
    try {
      this.ball = this.room.addSpecialObject(
        { x: -15, y: -15, r: 30 },
        { type: "color", value: "#ffaaaa" },
        {
          shape: "circ",
          dynamic: true,
          true: false,
        }
      );

      if (!this.ball) console.log("Couldn't add ball");
      this.ball.room = this.room;
    } catch (err) {
      throw err;
    }
  }

  tick(currentTime) {
    // check if touching any players
    this.room.players.forEach((p) => {
      this.ballImpact(p.position, p.velocities);
    });

    // check if on border to bounce

    // reset if gone too far off
    this.controlBallPosition();

    const timeBetween = currentTime - this.lastBallMove;

    const newX = this.ball.x + (this.ballVelocity.x * timeBetween) / 1000;
    const newY = this.ball.y + (this.ballVelocity.y * timeBetween) / 1000;

    this.ball.updatePosition({ x: newX, y: newY });
    this.lastBallMove = currentTime;
  }

  controlBallPosition() {
    if (Math.abs(this.ball.y) > 480) {
      this.ballVelocity.y = -this.ballVelocity.y / 2;
    }
    if (Math.abs(this.ball.x) > 1500) {
      this.ball.x = -15;
      this.ball.y = -15;
      this.ballVelocity = { x: 0, y: 0 };
    }
  }

  ballImpact(position, velocities) {
    const colliding = this.circleRectangleCollision(
      {
        x: this.ball.x,
        y: this.ball.y,
        r: this.ball.r,
      },
      position
    );

    if (!colliding) return;

    const momentumXPlayer = Number(this.playerMass * velocities.x);
    // const momentumXBall = Number(this.ballMass * this.ballVelocity.x);
    this.ballVelocity.x = momentumXPlayer / this.ballMass;

    const momentumYPlayer = Number(this.playerMass * velocities.y);
    // const momentumYBall = Number(this.ballMass * this.ballVelocity.y);
    this.ballVelocity.y = momentumYPlayer / this.ballMass;
  }

  circleRectangleCollision(circle, rectangle) {
    // if either x distance of y distance to
    // between center of circle and nearest side
    // of rectangle < radius of circle, intersection

    const intXLeft = Math.abs(circle.x + circle.r - rectangle.x) < circle.r;
    const intXRight =
      Math.abs(rectangle.x + rectangle.w - circle.x - circle.r) < circle.r;
    const intXMiddle =
      rectangle.x < circle.x && rectangle.x + rectangle.w > circle.x + circle.r;

    const intYTop = Math.abs(circle.y + circle.r - rectangle.y) < circle.r;
    const intYBottom =
      Math.abs(rectangle.y + rectangle.h - circle.y - circle.r) < circle.r;
    const intYMiddle =
      rectangle.y < circle.y && rectangle.y + rectangle.h > circle.y + circle.r;

    return (
      (intXLeft || intXMiddle || intXRight) &&
      (intYTop || intYMiddle || intYBottom)
    );
  }
};
