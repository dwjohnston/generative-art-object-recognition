
import { useEffect, useRef } from 'react';
import './App.css'
import party from "./assets/party.mp4";
import subway from "./assets/subway.mp4";
import { FilesetResolver, FaceLandmarker, DrawingUtils, HandLandmarker} from '@mediapipe/tasks-vision';

const videoWidth = 800;



function getPredictWebcam(video: HTMLVideoElement, canvasElement: HTMLCanvasElement, faceLandmarker: FaceLandmarker, drawingUtils: DrawingUtils, handLandmarker: HandLandmarker) {
  let lastVideoTime = -1;
  let faceResults = undefined;
  let handResults = undefined; 
  return async function predictWebcam() {
    const radio = video.videoHeight / video.videoWidth;
    video.style.width = videoWidth + "px";
    video.style.height = videoWidth * radio + "px";
    canvasElement.style.width = videoWidth + "px";
    canvasElement.style.height = videoWidth * radio + "px";
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    // Now let's start detecting the stream.
    // await faceLandmarker.setOptions({ runningMode: "VIDEO"  });
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      faceResults = faceLandmarker.detectForVideo(video, startTimeMs);
      handResults = handLandmarker.detectForVideo(video, startTimeMs);
    }
    if (faceResults.faceLandmarks) {
      for (const landmarks of faceResults.faceLandmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "#C0C0C070", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: "#30FF30" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: "#30FF30" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: "#E0E0E0" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: "#E0E0E0" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: "#30FF30" }
        );
      }
    }
    if (handResults.landmarks) {
      for (const landmarks of handResults.landmarks) {
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5
        });
        drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }

    // drawBlendShapes(videoBlendShapes, results.faceBlendshapes);

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);

  }
}


async function doTheThings() : Promise<[FaceLandmarker, HandLandmarker]> {
  const vision = await FilesetResolver.forVisionTasks(
    // path/to/wasm/root
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  const faceLandmarker = await FaceLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    });

  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 2
  });

  return [faceLandmarker, handLandmarker];
}


function App() {


  const doneRef = useRef(false);

  const webCamVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);


  useEffect(() => {

    if (!doneRef.current) {
      doneRef.current = true;
      console.log("Does this")

      doTheThings().then((v) => {
        const [face, hand] = v;
        faceLandmarkerRef.current = face;
        handLandmarkerRef.current = hand;
      });
    }
  }, []);



  return (
    <>
      <button onClick={() => {

        const constraints = {
          video: true
        };

        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {



          if (webCamVideoRef.current && canvasRef.current && faceLandmarkerRef.current && handLandmarkerRef.current) {
            webCamVideoRef.current.srcObject = stream;

            const webcam = webCamVideoRef.current;
            const canvas = canvasRef.current;
            const faceLandmarker = faceLandmarkerRef.current;
            const handLandmaker = handLandmarkerRef.current;



            const canvasContext = canvasRef.current.getContext("2d");
            if (!canvasContext) {
              throw new Error("No canvas context");
            }
            const drawingUtils = new DrawingUtils(canvasContext);
            webcam.addEventListener("loadeddata", getPredictWebcam(webcam, canvas, faceLandmarker, drawingUtils, handLandmaker))
          }


        });
      }}>enable webcam</button>
      <div className="video-container">
        <video id="webcam" autoPlay playsInline ref={webCamVideoRef} width={800} height={400}></video>
        <canvas className="output_canvas" id="output_canvas" ref={canvasRef} width={800} height={400}></canvas>
      </div>
    </>
  )
}

export default App
