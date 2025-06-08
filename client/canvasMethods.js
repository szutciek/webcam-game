let [footL, footR] = [new Image(), new Image()];
const foot = new Image();
foot.crossOrigin = "Anonymous";
foot.onload = () => {
  [footL, footR] = createMirroredImages(foot);
};
foot.src = "https://assets.kanapka.eu/images/footWCGame.png";

let [handL, handR] = [new Image(), new Image()];
const hand = new Image();
hand.crossOrigin = "Anonymous";
hand.onload = () => {
  [handL, handR] = createMirroredImages(hand);
};
hand.src = "https://assets.kanapka.eu/images/handWCGame.png";

const susLeg = new Image();
susLeg.src = "https://assets.kanapka.eu/images/susLeg.png";

const susTorso = new Image();
susTorso.src = "https://assets.kanapka.eu/images/susTorsoWCGame.png";

const createMirroredImages = (img) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.translate(0 + img.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0, img.width, img.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const mirrored = new Image();
  mirrored.src = canvas.toDataURL("image/png");
  return [img, mirrored];
};

export const drawFace = (ctx, x, y, w, h, cam) => {
  if (!cam) return;
  ctx.drawImage(cam, x + 5, y + 5, w - 10, w - 10);
};

export const drawBody = (ctx, player) => {
  const { x, y, w, h } = player;
  const pose = player.pose;

  const centerX = x + w / 2;

  const torsoTop = [centerX, y + h / 2 - 5];
  const torsoBottom = [centerX, y + h - 60];

  const leftHandStart = [centerX, y + h / 2 + 10];
  const leftHandEnd = [x + 15, y + h / 2 + 30];

  const rightHandStart = [centerX, y + h / 2 + 10];
  const rightHandEnd = [x + w - 15, y + h / 2 + 30];

  const leftLegStart = [centerX, y + h - 60];
  // const leftLegEnd = [x + w / 3, y + h];
  const leftLegEnd = [x + w / 2, y + h];

  const rightLegStart = [centerX, y + h - 60];
  // const rightLegEnd = [x + (2 * w) / 3, y + h];
  const rightLegEnd = [x + w / 2, y + h];

  ctx.font = " 30pt Poppins";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";

  ctx.beginPath();
  ctx.moveTo(...torsoTop);
  ctx.lineTo(...torsoBottom);
  ctx.stroke();

  if (pose.madLeft === true) {
    ctx.beginPath();
    ctx.moveTo(...leftHandStart);
    ctx.lineTo(x, y + h / 2 - 20);
    ctx.stroke();

    ctx.beginPath();

    ctx.fillText("🖕", x + 10, y + h / 2 - 20);
  } else {
    ctx.beginPath();
    ctx.moveTo(...leftHandStart);
    ctx.lineTo(...leftHandEnd);
    ctx.stroke();

    ctx.drawImage(handL, leftHandEnd[0] - 15, leftHandEnd[1] - 30, 30, 40);
  }

  if (pose.madRight === true) {
    ctx.beginPath();
    ctx.moveTo(...rightHandStart);
    ctx.lineTo(x + w, y + h / 2 - 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillText("🖕", x + w - 10, y + h / 2 - 5);
  } else {
    ctx.beginPath();
    ctx.moveTo(...rightHandStart);
    ctx.lineTo(...rightHandEnd);
    ctx.stroke();

    ctx.drawImage(handR, rightHandEnd[0] - 15, rightHandEnd[1] - 30, 30, 40);
  }

  ctx.beginPath();
  ctx.moveTo(...leftLegStart);
  ctx.lineTo(
    leftLegEnd[0] + player.animationMovement.left.disp,
    leftLegEnd[1] + player.animationMovement.left.lift
  );
  ctx.moveTo(...rightLegStart);
  ctx.lineTo(
    rightLegEnd[0] + player.animationMovement.right.disp,
    rightLegEnd[1] + player.animationMovement.right.lift
  );
  ctx.stroke();

  const actualVelX = Math.abs(player.velX) < 1 ? 0 : player.velX;

  let leftImage = actualVelX > 0 ? footR : footL;
  let rightImage = actualVelX > 0 ? footR : footL;

  if (actualVelX === 0) {
    leftImage = footL;
    rightImage = footR;
  }

  ctx.drawImage(
    leftImage,
    leftLegEnd[0] + player.animationMovement.left.disp - 30,
    leftLegEnd[1] + player.animationMovement.left.lift - 25,
    40,
    30
  );
  ctx.drawImage(
    rightImage,
    rightLegEnd[0] + player.animationMovement.right.disp - 10,
    rightLegEnd[1] + player.animationMovement.right.lift - 25,
    40,
    30
  );
};

export const drawSusBody = (ctx, player, data) => {
  const { x, y, w, h } = player;
  const centerX = x + w / 2;
  const torsoBottom = [centerX, y + 140];

  const legWidth = 40;
  const legHeight = 80;

  if (data?.modelLeg) {
    let anim = player.animationMovement.left;

    ctx.save();
    ctx.translate(torsoBottom[0] - 50 + legWidth / 2, torsoBottom[1]);
    ctx.rotate((anim.disp + 20) / 80);
    ctx.drawImage(
      data.modelLeg,
      -legWidth / 2,
      -20 - anim.lift,
      legWidth,
      legHeight
    );
    ctx.drawImage(susLeg, -legWidth / 2, -20 - anim.lift, legWidth, legHeight);
    ctx.restore();

    anim = player.animationMovement.right;

    ctx.save();
    ctx.translate(torsoBottom[0] + 10 + legWidth / 2, torsoBottom[1]);
    ctx.rotate((anim.disp - 20) / 80);
    ctx.drawImage(
      data.modelLeg,
      -legWidth / 2,
      -20 - anim.lift,
      legWidth,
      legHeight
    );
    ctx.drawImage(susLeg, -legWidth / 2, -20 - anim.lift, legWidth, legHeight);
    ctx.restore();
  }

  const traverseLift =
    player.animationMovement.left.lift + player.animationMovement.right.lift;
  if (data?.modelTorso) {
    ctx.drawImage(data.modelTorso, x, y + traverseLift / 2, 100, 200);
  }
  ctx.drawImage(susTorso, x, y + traverseLift / 2, 100, 200);
};

export const generateColoredImage = (dimensions, alpha, color) => {
  const c = document.createElement("canvas");
  c.width = dimensions.w;
  c.height = dimensions.h;
  const ct = c.getContext("2d");

  ct.drawImage(alpha, 0, 0, dimensions.w, dimensions.h);
  ct.globalCompositeOperation = "source-in";
  ct.fillStyle = color;
  ct.fillRect(0, 0, dimensions.w, dimensions.h);

  const data = c.toDataURL();
  const i = document.createElement("img");
  i.src = data;
  return i;
};

export const drawTag = (ctx, x, y, w, _, name) => {
  ctx.font = " 15pt Poppins";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(name, x + w / 2, y - 10);
};
