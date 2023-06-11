onmessage = (e) => {
  console.log(e.data);
  if (e.data.type === "stream") {
    console.log(e.data);
  }
};

const capturePicture = async () => {
  canvasStream.width = width;
  canvasStream.height = height;

  context.beginPath();
  context.arc(50, 50, 50, 0, 2 * Math.PI, true);
  context.closePath();

  context.clip();
  context.drawImage(video, 0, 0, width, height);

  const pic = await new Promise((res) => {
    canvasStream.toBlob((blob) => res(blob), "image/webp");
  });

  return pic;
};
