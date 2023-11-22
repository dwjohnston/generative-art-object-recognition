import { DrawingUtils, FaceDetectorResult, FaceLandmarkerResult, HandLandmarkerResult, ObjectDetectorResult, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { AbstractAlgorithm } from "../AbstractAlgorithm";
import { XYPair, createBallBounce } from "../ballBounce";
import { createDrawpixelGridFunction } from "../../draw/drawPixelGrid";
import { drawFaceLandmarks, drawHandLandmarks } from "../../draw/drawLandmarks";


type WorldObjects = {
    x: number;
    y: number;
    type: "face" | "hand";
}


export const lines: AbstractAlgorithm = (options) => {
    const { video, debugCanvas, artCanvas, mediapipe, debugCallback } = options;
    const {faceDetector, faceLandmarker, handLandmarker, objectDetector, poseLandmaker} = mediapipe; 


    const debugCtx = debugCanvas?.getContext("2d");
    const debugDrawingUtils = debugCtx ? new DrawingUtils(debugCtx) : null;

    function normalisePoint(point: XYPair): XYPair {


        return {
            x: Math.floor(point.x * (debugCanvas?.width ?? 0)),
            y: Math.floor(point.y * (debugCanvas?.height ?? 0)),
        }
    }


    


    let lastVideoTime = -1;
    let faceResults: FaceLandmarkerResult | undefined = undefined;
    let handResults: HandLandmarkerResult | undefined = undefined;
    let faceDetectorResults: FaceDetectorResult | undefined = undefined;
    let objectResults: ObjectDetectorResult | undefined = undefined; 
    let poseResults : PoseLandmarkerResult | undefined = undefined; 

    function drawLine(ctx: CanvasRenderingContext2D, from: XYPair, to: XYPair){
        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);

        // Add three color stops
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.01");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.001");

        ctx.strokeStyle = gradient; 

        ctx.moveTo(from.x, from.y); 
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    }


    function drawDot(ctx: CanvasRenderingContext2D, point: XYPair){

        ctx.fillStyle = 'red'; 

        ctx.fillRect(point.x, point.y, 3,3);
    }


    return function predictWebcam() {

        // Now let's start detecting the stream.
        const startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;
            poseResults = poseLandmaker.detectForVideo(video, startTimeMs);
        }

        if(poseResults){


            if(debugCtx && debugDrawingUtils) {

                debugCtx.strokeStyle='rgba(255, 255, '; 
                debugCtx.lineWidth=3;



                // debugCtx.clearRect(0, 0, debugCanvas?.width, debugCanvas?.height);

                /**
                 * Refer to this to find the useful landmarks 
                 * https://developers.google.com/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model
                 */
                poseResults?.landmarks.forEach((v) => {

                    const leftHeel = normalisePoint(v[29]); 
                    const rightHeel = normalisePoint(v[30]); 

                    const leftThumb = normalisePoint(v[21]); 
                    const rightThumb = normalisePoint(v[22]); 

                    const nose = normalisePoint(v[0]); 



                    [leftHeel, rightHeel, leftThumb, rightThumb, nose].forEach((v) => {
                        drawDot(debugCtx, v);
                    })

                    drawLine(debugCtx, leftHeel, rightHeel);
                    drawLine(debugCtx, leftThumb, rightThumb);
     

                    
                }); 



                    


            }
        }

        window.requestAnimationFrame(predictWebcam);

    }
}