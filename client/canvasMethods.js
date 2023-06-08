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
  const leftHandEnd = [x, y + h / 2 + 30];

  const rightHandStart = [centerX, y + h / 2 + 10];
  const rightHandEnd = [x + w, y + h / 2 + 30];

  const leftLegStart = [centerX, y + h - 60];
  const leftLegEnd = [x + w / 3, y + h];

  const rightLegStart = [centerX, y + h - 60];
  const rightLegEnd = [x + (2 * w) / 3, y + h];

  ctx.beginPath();

  ctx.moveTo(...torsoTop);
  ctx.lineTo(...torsoBottom);

  ctx.moveTo(...leftHandStart);
  ctx.lineTo(...leftHandEnd);

  ctx.moveTo(...rightHandStart);
  ctx.lineTo(...rightHandEnd);

  if (player.animationMovement.state === "idle") {
    ctx.moveTo(...leftLegStart);
    ctx.lineTo(...leftLegEnd);

    ctx.moveTo(...rightLegStart);
    ctx.lineTo(...rightLegEnd);
  } else {
    ctx.moveTo(...leftLegStart);
    ctx.lineTo(
      leftLegEnd[0] + player.animationMovement.left.disp,
      leftLegEnd[1]
    );

    ctx.moveTo(...rightLegStart);
    ctx.lineTo(
      rightLegEnd[0] + player.animationMovement.right.disp,
      rightLegEnd[1]
    );
  }

  ctx.stroke();
};

export const drawTag = (ctx, x, y, w, _, name) => {
  ctx.font = " 15pt Poppins";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(name, x + w / 2, y - 10);
};
