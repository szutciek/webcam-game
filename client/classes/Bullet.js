export default class Bullet {
  constructor(timestamp, angle, origin, weapon) {
    this.timestamp = timestamp;
    this.angle = angle;
    this.origin = origin;
    this.weapon = weapon;

    console.log(this);
  }

  draw(canvas) {
    canvas.ctx.beginPath();
    canvas.ctx.moveTo(...this.origin);
    canvas.ctx.lineTo(
      this.origin[0] + Math.sin(Math.PI + this.angle) * this.weapon.bulletRange,
      this.origin[1] + Math.cos(Math.PI + this.angle) * this.weapon.bulletRange
    );
    canvas.ctx.stroke();
  }

  get info() {
    return {
      timestamp: this.timestamp,
      angle: this.angle,
      origin: this.origin,
    };
  }
}
