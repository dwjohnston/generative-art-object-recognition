import { DrawingUtils, FaceDetector, FaceDetectorResult, FaceLandmarker, FaceLandmarkerResult, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { RefObject, useEffect, useRef } from "react";
import { instantiateModels } from "./mediapipe";
import { XYPair, createBallBounce } from "./ballBounce";
import { createDrawpixelGridFunction } from "../draw/drawPixelGrid";
import { drawFaceLandmarks, drawHandLandmarks } from "../draw/drawLandmarks";
import { AbstractAlgorithm } from "./AbstractAlgorithm";



type TheWholeThingOptions = {
    artCanvasRef: RefObject<HTMLCanvasElement>,
    webCamVideoRef: RefObject<HTMLVideoElement>,
    debugCanvasRef?: RefObject<HTMLCanvasElement>,
    debugCallback?: (data: unknown) => void, 
    algorithm: AbstractAlgorithm
}

export function useTheWholeThing(options: TheWholeThingOptions): {
    ready: boolean
} {

    const {artCanvasRef, webCamVideoRef, debugCallback, debugCanvasRef, algorithm } = options;


    const doneRef = useRef(false);
    useEffect(() => {
        if (!doneRef.current) {
            doneRef.current = true;
            console.log("Does this")

            instantiateModels().then((v) => {
                const [faceLandmarker, handLandmarker, faceDetector] = v;

                const constraints = {
                    video: true
                };

                const webcam = webCamVideoRef.current;
                const canvas = debugCanvasRef?.current ?? undefined;
                const artCanvas = artCanvasRef.current;


                if(!webcam?.src){
                    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

                        if (webcam && artCanvas) {
                            webcam.srcObject = stream;
    
                            webcam.addEventListener("loadeddata", () => {
                                const canvasWidth = artCanvas.clientWidth;
                                const canvasHeight = artCanvas.clientHeight;
    
    
                                // This just makes the canvas and video the right size. 
                                // Doesn't really matter main art canvas as we only really care about a 0-1 values. 
                                if (canvas) {
                                    const ratio = webcam.videoHeight / webcam.videoWidth;
                                    webcam.style.width = canvasWidth + "px";
                                    webcam.style.height = canvasHeight * ratio + "px";
    
                                    canvas.style.width = canvasWidth + "px";
                                    canvas.style.height = canvasHeight * ratio + "px";
                                    canvas.width = webcam.videoWidth;
                                    canvas.height = webcam.videoHeight;
                                }
                            });
    
                            webcam.addEventListener("loadeddata", algorithm({ video: webcam, debugCanvas: canvas, faceLandmarker, handLandmarker, artCanvas, faceDetector, debugCallback }))
                        }
    
        
                    });
                }

                else {

                    if(webcam && artCanvas) {
                        webcam.addEventListener("play", algorithm({ video: webcam, debugCanvas: canvas, faceLandmarker, handLandmarker, artCanvas, faceDetector, debugCallback }))
                        webcam.play();
    
                    }
           
                }


            });



        }
    }, [artCanvasRef, debugCallback, debugCanvasRef, webCamVideoRef, algorithm]);


    return { ready: doneRef.current };
}



