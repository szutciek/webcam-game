const lerp = (s, e, t) => s + (e - s) * t;

module.exports = class Bullet {
  alreadyCollided = new Set();

  constructor(uuid, player, data, weapon) {
    this.uuid = uuid || crypto.randomUUID();
    this.player = player;
    this.origin = [
      this.player.x + this.player.w / 2,
      this.player.y + this.player.h / 2,
    ];
    this.timestamp = data.timestamp;
    this.angle = data.angle + Math.PI / 2;
    this.weapon = weapon;
    this.weapon.travelTime =
      (this.weapon.bulletRange / this.weapon.bulletSpeed) * 1000;

    this.calculateFinalPosition();
  }

  calculateFinalPosition() {
    const distX = Math.cos(this.angle) * this.weapon.bulletRange;
    const distY = Math.sin(this.angle) * this.weapon.bulletRange;
    this.final = [this.origin[0] + distX, this.origin[1] + distY];
  }

  collidesWith({ x, y, w, h }, uuid) {
    console.log(x, y, w, h);

    this.alreadyCollided.add(uuid);
    if (uuid !== undefined && this.alreadyCollided.has(uuid)) return false;
    return true;
  }

  currentPosition(timeSinceStart) {
    const timeSinceShot = timeSinceStart - this.timestamp;
    if (timeSinceShot > this.weapon.travelTime) return;
    const progress = timeSinceShot / this.weapon.travelTime;
    const x = lerp(this.origin[0], this.final[0], progress);
    const y = lerp(this.origin[1], this.final[1], progress);
    return [x, y];
  }

  get broadcastData() {
    return {
      uuid: this.uuid,
      origin: this.origin,
      final: this.final,
      timestamp: this.timestamp,
      angle: this.angle,
      weapon: this.weapon.name,
      player: {
        uuid: this.player.uuid,
        username: this.player.username,
      },
    };
  }
};
