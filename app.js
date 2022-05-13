const video = document.getElementById('video');

const startVideo = () => {
    navigator.mediaDevices.getUserMedia({
        video :{},
        audio : false,
    }).then((stream) => {
        video.srcObject = stream;
    });
};

startVideo();

