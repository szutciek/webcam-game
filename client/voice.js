let audioData = [];
let timeStamp = 0;
let recorder = undefined;

export const requestMicPermission = () => {
  return new Promise(async (res, rej) => {
    try {
      const permission = await navigator.permissions.query({
        name: "microphone",
      });
      if (permission.state !== "denied") res();
      rej(new Error("Couldn't get camera permissions"));
    } catch (err) {
      rej(new Error("Couldn't get camera permissions"));
    }
  });
};

const setupWorker = () => {
  if (!window.Worker) throw new Error("Web worker not supported");
  // cook later because can't record in worker
};

export const startAudioStream = () => {
  return new Promise(async (res, rej) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      recorder = new MediaRecorder(stream);
      recorder.start();
      recorder.addEventListener("dataavailable", (e) => {
        timeStamp = e.timeStamp;
        audioData.push(e.data);
      });
      res(true);
    } catch (err) {
      rej(new Error("Couldn't get camera feed"));
    }
  });
};

export const getRecordedAudio = () => {
  const blob = new Blob(audioData, {
    type: "audio/webm;codecs=opus",
  });
  audioData = [];
  recorder.requestData();
  return [blob, timeStamp];
};
