
import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, FaceLandmarker, DrawingUtils, HandLandmarker, FaceLandmarkerResult, HandLandmarkerResult, FaceDetector, FaceDetectorResult} from '@mediapipe/tasks-vision';
import { createDrawpixelGridFunction } from '../draw/drawPixelGrid';
import { createBallBounce } from '../model/ballBounce';
import { Debug } from '../components/Debug';
import { useBoolean } from '../utils/useBoolean';

const WIDTH = 400; 
const HEIGHT = 400; 


type WorldObjects = {
  x: number; 
  y: number; 
  type: "face" | "hand"; 
}


function getPredictWebcam(
    video: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    faceLandmarker: FaceLandmarker,
    drawingUtils: DrawingUtils,
    handLandmarker: HandLandmarker,
    artCanvas: HTMLCanvasElement,
    faceDetector: FaceDetector,
    debugCallback: (value: unknown) => void
) {
  let lastVideoTime = -1;
  let faceResults: FaceLandmarkerResult | undefined = undefined;
  let handResults : HandLandmarkerResult | undefined = undefined; 
  let faceDetectorResults: FaceDetectorResult | undefined = undefined; 

  const drawFn = createDrawpixelGridFunction(artCanvas, 10, 10, 0.01);

  const ballFunction = createBallBounce();

  return async function predictWebcam() {

    const worldObjects : Array<WorldObjects> = []; 

    const radio = video.videoHeight / video.videoWidth;
    video.style.width = WIDTH + "px";
    video.style.height = WIDTH * radio + "px";
    canvasElement.style.width = WIDTH + "px";
    canvasElement.style.height = WIDTH * radio + "px";
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    // Now let's start detecting the stream.
    // await faceLandmarker.setOptions({ runningMode: "VIDEO"  });
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      faceResults = faceLandmarker.detectForVideo(video, startTimeMs);
      handResults = handLandmarker.detectForVideo(video, startTimeMs);
      faceDetectorResults = faceDetector.detectForVideo(video, startTimeMs);
    }
    if (faceResults?.faceLandmarks) {

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
    if (handResults?.landmarks) {


      // I really just want a bounding box like the FaceDetector, but apparently isn't possible
      // So I'll just take the first one, it doesn't really matter. 
      const firstLandmark = handResults.landmarks[0]; 
      if(firstLandmark) {
        console.log(firstLandmark)
      }

      for (const landmarks of handResults.landmarks) {

        worldObjects.push({
          type:"hand", 
          x: landmarks[0].x, 
          y: landmarks[0].y
        }); 

        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5
        });
        drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 2 });


        
      }
    }

    const newBallPosition = ballFunction(); 
    drawFn([{...newBallPosition, color: "rgba(255, 255, 255)"}])


    if(faceDetectorResults?.detections){



      faceDetectorResults.detections.forEach((v) => {


      worldObjects.push({
        type:"face", 
        x: v.keypoints[0].x,
        y: v.keypoints[0].y,
      }); 
      })
    }

    // drawBlendShapes(videoBlendShapes, results.faceBlendshapes);




    drawFn(worldObjects.map((v) => {
      return {
        x: v.x, 
        y: v.y, 
        color: v.type=== "face" ? "red" : "blue"
      }
    }));

    debugCallback(newBallPosition)

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);

  }
}


async function instantiateModels() : Promise<[FaceLandmarker, HandLandmarker, FaceDetector]> {
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

  const faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
      delegate: "GPU"
    },
    runningMode: "VIDEO"
  }); 



  return [faceLandmarker, handLandmarker, faceDetector];
}


export function Development() {


  const doneRef = useRef(false);

  const webCamVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const artCanvasRef = useRef<HTMLCanvasElement>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  const [showWebCam, toggleWebcam] = useBoolean(true); 
  const [showOverlay, toggleOverlay] = useBoolean(true);


  const [debug, setDebug] = useState<unknown>(null);

  useEffect(() => {

    if (!doneRef.current) {
      doneRef.current = true;
      console.log("Does this")

      instantiateModels().then((v) => {
        const [face, hand, faceDetector] = v;
        faceLandmarkerRef.current = face;
        handLandmarkerRef.current = hand;




        const constraints = {
          video: true
        };

        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {



          if (webCamVideoRef.current && canvasRef.current && faceLandmarkerRef.current && handLandmarkerRef.current && artCanvasRef.current) {
            webCamVideoRef.current.srcObject = stream;

            const webcam = webCamVideoRef.current;
            const canvas = canvasRef.current;
            const faceLandmarker = faceLandmarkerRef.current;
            const handLandmaker = handLandmarkerRef.current;
            const artCanvas = artCanvasRef.current; 



            const canvasContext = canvasRef.current.getContext("2d");
            if (!canvasContext) {
              throw new Error("No canvas context");
            }
            const drawingUtils = new DrawingUtils(canvasContext);
            webcam.addEventListener("loadeddata", getPredictWebcam(webcam, canvas, faceLandmarker, drawingUtils, handLandmaker, artCanvas, faceDetector, setDebug))
          }


        });
      });



    }
  }, []);



  return (
    <>

<div>
    <Debug data={debug}/>
    <button onClick={toggleWebcam}>show webcam</button>
    <button onClick={toggleOverlay}>show overlay</button>

      <div className="video-container">

        <div>
            {showWebCam &&<video id="webcam" autoPlay playsInline ref={webCamVideoRef} width={WIDTH} height={HEIGHT}></video>}
        </div>
        <div>
            {showOverlay && <canvas className="output_canvas" id="output_canvas" ref={canvasRef} width={WIDTH} height={HEIGHT}></canvas>}
        </div>
        <div>
            <canvas className="output_canvas" id="art-canvas" ref={artCanvasRef} width={WIDTH} height={HEIGHT}></canvas>
        </div>
      </div>
      </div>
    </>
  )
}

