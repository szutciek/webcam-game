const [width, height] = [100, 100];

const video = document.createElement("video");
const canvasStream = document.createElement("canvas");

const context = canvasStream.getContext("2d");

try {
  let stream = undefined;

  const startStream = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    video.srcObject = stream;
    video.play();
  };

  await startStream();
} catch (err) {
  throw err;
}

let picture = undefined;
const takepicture = () => {
  canvasStream.width = width;
  canvasStream.height = height;
  context.drawImage(video, 0, 0, width, height);

  canvasStream.toBlob(
    (blob) => {
      picture = blob;
    },
    "image/jpeg",
    0.5
  );

  return picture;
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

export const getPicture = () => {
  return new Promise(async (res, rej) => {
    try {
      res(await convertBlobBase64(takepicture()));
    } catch (err) {
      rej(err);
    }
  });
};
