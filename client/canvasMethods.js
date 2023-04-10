export const drawFace = (ctx, x, y, w, h, cam) => {
  if (!ctx instanceof HTMLCanvasElement) return;
  if (!cam) return;

  // ctx.drawImage(cam, x + 5, y + 5, w - 10, w - 10);

  // decreased size for realism
  ctx.drawImage(cam, x + 5, y + 5, w - 10, w - 10);
};

export const drawBody = (ctx, x, y, w, h, pose) => {
  ctx.beginPath();

  if (pose.crouching) {
    // torso
    // decreased size for realism
    ctx.moveTo(x + w / 2, y + 95);
    ctx.lineTo(x + w / 2, y + 135);

    // left arm
    ctx.moveTo(x + w / 2, y + 115);
    ctx.lineTo(x + w - 20, y + h - 30);
    ctx.lineTo(x + w / 2 + 10, y + h - 15);

    // right arm
    ctx.moveTo(x + w / 2, y + 115);
    ctx.lineTo(x + 20, y + h - 30);
    ctx.lineTo(x + w / 2 - 10, y + h - 15);

    // left leg
    ctx.moveTo(x + w / 2, y + 135);
    ctx.lineTo(x + w - 10, y + h - 5);

    // right leg
    ctx.moveTo(x + w / 2, y + 135);
    ctx.lineTo(x + 10, y + h - 5);
  } else {
    // torso
    // decreased size for realism
    ctx.moveTo(x + w / 2, y + h / 2 - 5);
    ctx.lineTo(x + w / 2, y + (3 * h) / 4);

    // left arm
    if (pose.madRight) {
      ctx.moveTo(x + w / 2, y + (3 * h) / 5);
      ctx.lineTo(x + w - 30, y + h - 50);
      ctx.lineTo(x + w - 15, y + h - 70);

      const palmX = x + w - 15;
      const palmY = y + h - 70;

      ctx.lineTo(palmX + 10, palmY - 3);
      ctx.moveTo(palmX, palmY);

      ctx.lineTo(palmX + 8, palmY - 6);
      ctx.moveTo(palmX, palmY);

      ctx.lineTo(palmX + 8, palmY - 14);
      ctx.moveTo(palmX, palmY);

      ctx.lineTo(palmX, palmY - 9);
      ctx.moveTo(palmX, palmY);

      ctx.lineTo(palmX - 4, palmY - 7);
      ctx.moveTo(palmX, palmY);
    } else {
      ctx.moveTo(x + w / 2, y + (3 * h) / 5);
      ctx.lineTo(x + w - 5, y + h / 2);
    }

    // right arm
    if (pose.madLeft) {
      ctx.moveTo(x + w / 2, y + (3 * h) / 5);
      ctx.lineTo(x + 30, y + h - 50);
      ctx.lineTo(x + 15, y + h - 70);

      const palmX = x + 15;
      const palmY = y + h - 70;

      ctx.lineTo(palmX - 10, palmY - 3);
      ctx.moveTo(palmX, palmY);

      ctx.lineTo(palmX - 8, palmY - 6);
      ctx.moveTo(palmX, palmY);

      ctx.lineTo(palmX - 8, palmY - 14);
      ctx.moveTo(palmX, palmY);

      ctx.lineTo(palmX, palmY - 9);
      ctx.moveTo(palmX, palmY);

      ctx.lineTo(palmX + 4, palmY - 7);
      ctx.moveTo(palmX, palmY);
    } else {
      ctx.moveTo(x + w / 2, y + (3 * h) / 5);
      ctx.lineTo(x + 5, y + h / 2);
    }

    // left leg
    ctx.moveTo(x + w / 2, y + (3 * h) / 4);
    ctx.lineTo(x + w - 20, y + h - 5);

    // right leg
    ctx.moveTo(x + w / 2, y + (3 * h) / 4);
    ctx.lineTo(x + 20, y + h - 5);
  }

  ctx.stroke();
};

export const drawTag = (ctx, x, y, w, _, name) => {
  ctx.font = "16px Poppins";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(name, x + w / 2, y - 10);
};
