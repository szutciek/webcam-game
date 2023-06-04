const GameMode = require("./GameMode.js");

const lerp = (s, e, t) => {
  return (1 - t) * s + t * e;
};

module.exports = class Soccer extends GameMode {
  mode = "soccer";

  lastContact = undefined;
  score = [0, 0];

  ballVelocity = {
    x: 0,
    y: 0,
  };

  ballMass = 0.5;
  playerMass = 50;

  lastBallMove = 0;

  obstacles = [];
  horizontalWalls = [];
  verticalWalls = [];
  posts = [];
  goals = [];

  inGoal = false;
  goalArea = {
    y: -150,
    h: 350,
  };

  constructor(host, room) {
    super(host, room);

    this.spawnBall();

    setImmediate(() => {
      this.obstacles = this.getObstacles();
      this.sortObstacles();
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
      obstacles.push(...q.staticObjects.values());
    });
    return obstacles;
  }

  sortObstacles() {
    this.obstacles.forEach((o) => {
      if (!o.class) return;
      if (o.class === "soccer_wall_vert") {
        this.verticalWalls.push(o);
      }
      if (o.class === "soccer_wall_hor") {
        this.horizontalWalls.push(o);
      }
      if (o.class === "soccer_post") {
        this.posts.push(o);
      }
      if (o.class === "soccer_post") {
        this.posts.push(o);
      }
      if (o.class === "soccer_goal_0") {
        this.goals.push(o);
      }
      if (o.class === "soccer_goal_1") {
        this.goals.push(o);
      }
    });
  }

  spawnBall() {
    try {
      this.ball = this.room.addSpecialObject(
        { x: -30, y: -30, r: 30 },
        { type: "graphic", value: "https://assets.kanapka.eu/images/ball.png" },
        {
          shape: "circ",
          dynamic: true,
          colliding: false,
          class: "soccer_ball",
        }
      );

      this.ball.room = this.room;
    } catch (err) {
      throw err;
    }
  }

  tick(currentTime) {
    // check if touching any players
    this.room.players.forEach((p) => {
      this.ballImpact(p.position, p.velocities, p.uuid);
    });

    // check if on border to bounce

    // reset if gone too far off
    this.controlBallPosition();

    const timeBetween = currentTime - this.lastBallMove;

    const newX = this.ball.x + (this.ballVelocity.x * timeBetween) / 1000;
    const newY = this.ball.y + (this.ballVelocity.y * timeBetween) / 1000;

    this.slowBallDown();

    this.ball.updatePosition({ x: newX, y: newY });
    this.lastBallMove = currentTime;
  }

  slowBallDown() {
    this.ballVelocity.x =
      Math.sign(this.ballVelocity.x) *
      Math.floor(Math.abs((79 * this.ballVelocity.x) / 80));
    this.ballVelocity.y =
      Math.sign(this.ballVelocity.y) *
      Math.floor(Math.abs((79 * this.ballVelocity.y) / 80));
  }

  resetBall() {
    this.inGoal = false;
    this.ballVelocity.x = 0;
    this.ballVelocity.y = 0;
    this.ball.r = 30;
    this.ball.updatePosition({ x: -30, y: -30 });
  }

  handleGoal(goalNr) {
    let player;
    this.room.players.forEach((p) => {
      if (p.uuid === this.lastContact) player = p.username;
    });
    if (!player) player = "Anonymous";

    this.inGoal = true;
    this.score[goalNr]++;
    setTimeout(() => {
      this.resetBall();
    }, 1000);
    this.room.broadcast({
      type: "game",
      event: "goal",
      message: `${player} scored a goal! ${this.score[0]}:${this.score[1]}`,
      score: this.score,
    });
  }

  controlBallPosition() {
    this.horizontalWalls.forEach((wall) => {
      if (this.inGoal === true) return;
      if (wall.y < 0) {
        if (this.ball.y < wall.y + wall.h) {
          this.ballVelocity.y = Math.abs(this.ballVelocity.y);
        }
      } else {
        if (this.ball.y + this.ball.r * 2 > wall.y) {
          this.ballVelocity.y = -Math.abs(this.ballVelocity.y);
        }
      }
    });

    this.verticalWalls.forEach((wall) => {
      if (this.inGoal === true) return;
      if (
        this.ball.y < this.goalArea.y ||
        this.ball.y + this.ball.r * 2 > this.goalArea.y + this.goalArea.h
      ) {
        if (wall.x < 0) {
          if (this.ball.x < wall.x + wall.w) {
            this.ballVelocity.x = Math.abs(this.ballVelocity.x);
          }
        } else {
          if (this.ball.x + this.ball.r * 2 > wall.x) {
            this.ballVelocity.x = -Math.abs(this.ballVelocity.x);
          }
        }
      }
    });

    this.goals.forEach((goal) => {
      if (this.inGoal === true) return;
      if (goal.class === "soccer_goal_0") {
        if (this.ball.x + this.ball.r * 2 < goal.x + goal.w) {
          this.handleGoal(1);
        }
      }
      if (goal.class === "soccer_goal_1") {
        if (this.ball.x > goal.x) {
          this.handleGoal(0);
        }
      }
    });
  }

  ballImpact(position, velocities, uuid) {
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

    this.lastContact = uuid;
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

  handleEvent(player, data) {}

  get info() {
    return {
      score: this.score,
    };
  }
};
