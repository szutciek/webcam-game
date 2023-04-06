export default class Player {
  shape = "player";

  constructor({ x, y, w, h }, info) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.username = info.username;
    this.camera = info?.camera;

    this.lastUpdate = new Date().getTime();
  }

  updatePosition([x, y, w, h]) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.lastUpdate = new Date().getTime();
  }

  updatePose(pose) {
    this.pose = pose;
  }

  updateInfo(info) {
    if (info.username) this.username = info.username;
    if (info.camera) {
      this.camera = info.camera;
    }
  }
}
