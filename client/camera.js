const video = document.createElement("video");
const canvasStream = document.createElement("canvas");
const context = canvasStream.getContext("2d");

const [width, height] = [100, 100];
export let videoStream = undefined;

export const requestCameraPermission = () => {
  return new Promise(async (res, rej) => {
    try {
      const permission = await navigator.permissions.query({ name: "camera" });
      if (permission.state !== "denied") res();
      rej(new Error("Couldn't get camera permissions"));
    } catch (err) {
      rej(new Error(`Error while getting camera permissions: ${err}`));
    }
  });
};

const setupWorker = () => {
  if (!window.Worker) throw new Error("Web worker not supported");
  // cook later because can't record in worker
};

export const startVideoStream = () => {
  return new Promise(async (res, rej) => {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 100,
          height: 100,
          frameRate: 15,
          facingMode: "user",
        },
        audio: false,
      });
      video.srcObject = videoStream;
      video.play();
      res(true);
    } catch (err) {
      rej(new Error("Couldn't get camera feed"));
    }
  });
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

const convertBlobBase64 = (blob) => {
  return new Promise((res, rej) => {
    if (typeof blob !== "object") rej();

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      res(reader.result);
    });

    reader.readAsDataURL(blob);
  });
};

const preloadPicture = () => {
  return new Promise(async (res, rej) => {
    try {
      res(await convertBlobBase64(await capturePicture()));
    } catch (err) {
      rej(err);
    }
  });
};

let lastPicture = "";
setInterval(async () => {
  lastPicture = await preloadPicture();
}, 1000 / 15);

export const takePicture = () => {
  return lastPicture;
};
