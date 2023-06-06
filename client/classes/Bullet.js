const lerp = (s, e, t) => s + (e - s) * t;

export default class Bullet {
  constructor(timestamp, angle, origin, weapon, uuid) {
    this.uuid = uuid || crypto.randomUUID();
    this.timestamp = timestamp;
    this.angle = angle;
    this.origin = origin;
    this.weapon = weapon;
  }

  draw(canvas, originParam, finalParam, percentage = 0) {
    let origin = originParam;
    if (!origin) {
      origin = this.origin;
    }
    let final = finalParam;
    if (!final) {
      final = [
        origin[0] +
          Math.sin(Math.PI / 2 + this.angle) * this.weapon.bulletRange,
        origin[1] +
          Math.cos(Math.PI / 2 + this.angle) * this.weapon.bulletRange,
      ];
    }

    canvas.ctx.beginPath();
    canvas.ctx.moveTo(...origin);
    canvas.ctx.lineTo(...final);
    canvas.ctx.stroke();

    canvas.ctx.fillStyle = this.weapon.bulletColor || "black";
    canvas.ctx.fillRect(
      lerp(origin[0], final[1], percentage),
      lerp(origin[1], final[1], percentage),
      5,
      5
    );
  }

  get info() {
    return {
      uuid: this.uuid,
      timestamp: this.timestamp,
      angle: this.angle,
    };
  }

  get final() {
    return [
      this.origin[0] +
        Math.sin(this.angle + Math.PI / 2) * this.weapon.bulletRange,
      this.origin[1] +
        Math.cos(this.angle + Math.PI / 2) * this.weapon.bulletRange,
    ];
  }

  timeSinceShot(timeSinceStart) {
    return timeSinceStart - this.timestamp;
  }
}
