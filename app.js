//Defining the video feed for the app 
const video = document.getElementById('video');

// Capturing the video from the browser.
const startVideo = () => {
    navigator.mediaDevices.getUserMedia({
        video :{},
        audio : false,
    }).then((stream) => {
        video.srcObject = stream,
        err => console.error(err)
    });
}


// Loading all the weights from the weights provided by the face-api
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/weights')
]).then(startVideo())


//Overlaying canvas over the video detections.
video.addEventListener('playing', () => {
    const canvas = faceapi.createCanvasFromMedia(video) 
    document.body.append(canvas)
    const displaySize = {width : video.width, height : video.height}
    faceapi.matchDimensions(canvas,displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const adjusted = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, adjusted)
        faceapi.draw.drawFaceExpressions(canvas, adjusted)
    }, 100)
})
