//Defining the video feed for the app
const video = document.getElementById("video");
const video1 = document.querySelector(".display__video");

// Capturing the video from the browser.
const startVideo = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: {},
      audio: false,
    })
    .then((stream) => {
      (video.srcObject = stream), (err) => console.error(err);
    });
};

// Loading all the weights from the weights provided by the face-api
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/weights"),
  faceapi.nets.faceExpressionNet.loadFromUri("/weights"),
]).then(startVideo());

//Overlaying canvas over the video detections.
video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);

  canvas.setAttribute("class", "display__canvas");
  video.insertAdjacentElement("beforebegin", canvas);
  const dimension = video.getBoundingClientRect();
  console.log(dimension.width);
  const displaySize = { width: dimension.width, height: dimension.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const adjusted = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, adjusted);
    faceapi.draw.drawFaceExpressions(canvas, adjusted);
  }, 100);
});

const form = document.querySelector(".form");
let positionX = 0;
let positionY = 0;
form.addEventListener("click", (e) => {
  console.log(e);
  positionX = e.clientX;
  positionY = e.clientY;
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const pointer = document.querySelector(".pointer");
  const result_page = document.querySelector(".container2");
  const show__result = document.querySelector(".container2__show__result");
  console.log(pointer);
  pointer.style.setProperty("left", `${positionX - 60}px`);
  pointer.style.setProperty("top", `${positionY - 60}px`);
  pointer.style.setProperty("transform", `scaleX(80) scaleY(80)`);
  pointer.style.setProperty("opacity", `1`);
  result_page.style.setProperty("width", "145.5rem");
  result_page.style.setProperty("height", "58rem");
  result_page.style.setProperty("opacity", "1");
  result_page.style.setProperty("visibility", "visible");
  setTimeout(() => {
    const container = document.querySelector(".container");
    container.remove();
  }, 2000);
});
