export const drawFace = (ctx, x, y, w, h, cam) => {
  if (!ctx instanceof HTMLCanvasElement) return;
  if (!cam) return;

  // const radius = (w - 20) / 2;

  // ctx.beginPath();
  // ctx.arc(x + w / 2, y + w / 2 - 5, radius, 0, 360);
  // ctx.clip();
  ctx.drawImage(cam, x, y, w, w);
  // ctx.restore();
};
