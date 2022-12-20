//Defining the video feed for the app.
const video = document.getElementById("video");
const video1 = document.querySelector(".display__video");
let adjusted;
const emotionMap = new Map([]);


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

const form_Answer = {
  name: "",
  email: "",
  question1: [
    "",
    new Map([
      ["angry", 0],
      ["disgusted", 0],
      ["fearful", 0],
      ["happy", 0],
      ["neutral", 0],
      ["sad", 0],
      ["surprised", 0],
    ]),
    "",
    "How is your relationship with the team?",
  ],
  question2: [
    "",
    new Map([
      ["angry", 0],
      ["disgusted", 0],
      ["fearful", 0],
      ["happy", 0],
      ["neutral", 0],
      ["sad", 0],
      ["surprised", 0],
    ]),
    "",
    "How is your experience in this company?",
  ],
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
  const displaySize = { width: dimension.width, height: dimension.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    adjusted = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, adjusted);
    faceapi.draw.drawFaceExpressions(canvas, adjusted);
  }, 100);
});

const form = document.querySelector(".form");
let positionX = 0;
let positionY = 0;

form.addEventListener("click", (e) => {
  positionX = e.clientX;
  positionY = e.clientY;
});
form.addEventListener("input", (e) => {
  const question_number = e.target.dataset.question;
  if (!question_number) return;
  const expressions = adjusted[0].expressions;
  const values = Object.values(expressions);
  const valuesCpy = values.map((value) => value);
  const keys = Object.keys(expressions);
  values.sort(function (a, b) {
    return a - b;
  });
  const position = valuesCpy.indexOf(values[6]);
  const emotion = keys[position];
  // form_Answer.question1[1].push({ type: emotion });
  form_Answer[question_number][1].set(
    emotion,
    form_Answer[question_number][1].get(emotion) + 1
  );
});

// Major Display Section for the app.

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const pointer = document.querySelector(".pointer");
  const result_page = document.querySelector(".container2");
  const show__result = document.querySelector(".container2__show__result");
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
  const Answers = document.querySelectorAll(".form__input");
  Answers.forEach((el) => {
    if (el.id.startsWith("question")) {
      form_Answer[el.id][0] = el.value;
    } else {
      form_Answer[el.id] = el.value;
    }
  });
  calculatefinalEmotion();
  displayResult();
});

// Function to calculate to final emotion from the model.

function calculatefinalEmotion() {
  const questions = [form_Answer.question1, form_Answer.question2];
  questions.forEach((el) => {
    let max = el[1].get("neutral");
    console.log(max);
    el[2] = "neutral";
    el[1].forEach((value, key) => {
      if (value > max) {
        max = value;

        el[2] = key;
        console.log(el[2], key);
      }
    });
  });
}

// Function to fetch the result from the emotion detection model.

function displayResult() {
  const displayContent = document.querySelector(".popup__content");
  const container = document.createElement("div");
  const name = `  <div class="popup__content__form">
  <div class="popup__content__question">Your Name:</div>
  <div class="popup__content__answer">${form_Answer.name}</div>
 </div>`;
  const email = `<div class="popup__content__form">
  <div class="popup__content__question">Your Email ID:</div>
  <div class="popup__content__answer">${form_Answer.email}</div>
 </div>`;
  displayContent.insertAdjacentHTML("beforeend", name);
  displayContent.insertAdjacentHTML("beforeend", email);
  const questions = [form_Answer.question1, form_Answer.question2];
  const response = questions.map(
    (el) =>
      `<div class="popup__content__form">
    <div class="popup__content__question">${el[3]}</div>
    <div class="popup__content__answer">${el[0]}</div>
    <div class="popup__content__emotion">
      Your Emotion: <span>${el[2]}</span>
    </div>
  </div>`
  );
  response.forEach((el) => {
    displayContent.insertAdjacentHTML("beforeend", el);
  });
}
