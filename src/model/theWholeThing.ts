import { DrawingUtils, FaceDetector, FaceDetectorResult, FaceLandmarker, FaceLandmarkerResult, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { RefObject, useEffect, useRef } from "react";
import { instantiateModels } from "./mediapipe";
import { XYPair, createBallBounce } from "./ballBounce";
import { createDrawpixelGridFunction } from "../draw/drawPixelGrid";
import { drawFaceLandmarks, drawHandLandmarks } from "../draw/drawLandmarks";


type WorldObjects = {
    x: number;
    y: number;
    type: "face" | "hand";
}



export function useTheWholeThing(artCanvasRef: RefObject<HTMLCanvasElement>, webCamVideoRef: RefObject<HTMLVideoElement>, debugCanvasRef?: RefObject<HTMLCanvasElement>, debugCallback?: (data: unknown) => void): {
    ready: boolean
} {


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

                        webcam.addEventListener("loadeddata", getPredictWebcam({ video: webcam, debugCanvas: canvas, faceLandmarker, handLandmarker, artCanvas, faceDetector, debugCallback }))
                    }

                    const canvasContext = debugCanvasRef?.current?.getContext("2d");
                    if (!canvasContext) {
                        throw new Error("No canvas context");
                    }
                });
            });



        }
    }, [artCanvasRef, debugCallback, debugCanvasRef, webCamVideoRef]);


    return { ready: doneRef.current };
}





type PredictWebcamOptions = {
    video: HTMLVideoElement,
    debugCanvas?: HTMLCanvasElement,
    faceLandmarker: FaceLandmarker,
    handLandmarker: HandLandmarker,
    artCanvas: HTMLCanvasElement,
    faceDetector: FaceDetector,
    debugCallback?: (value: unknown) => void
}


function getPredictWebcam(
    options: PredictWebcamOptions
) {

    const { video, debugCanvas, faceLandmarker, handLandmarker, artCanvas, faceDetector, debugCallback } = options;


    const debugCtx = debugCanvas?.getContext("2d");
    const debugDrawingUtils = debugCtx ? new DrawingUtils(debugCtx) : null;


    let lastVideoTime = -1;
    let faceResults: FaceLandmarkerResult | undefined = undefined;
    let handResults: HandLandmarkerResult | undefined = undefined;
    let faceDetectorResults: FaceDetectorResult | undefined = undefined;


    const ballFunction = createBallBounce({
        initialDelta: {
            x: 0.008,
            y: -0.002
        },
        gravity: {
            x: 0,
            y: 0.002
        }
    });


    let frameCount = 0;
    const DECAY_COUNT = 10;
    const N_CELLS = 24;
    const OBJECT_BOUNCE_ADD = 0.002;
    const OBJECT_BOUNCE_MULTIPLY = 0.8;

    const drawFn = createDrawpixelGridFunction(artCanvas, N_CELLS, N_CELLS, 0.01);


    const frameArray = new Array(N_CELLS).fill(true).map((v) => {
        return new Array(N_CELLS).fill(null);
    })

    function ballDeltaFn(position: XYPair, currentDelta: XYPair) {

        const normalisedPosition = normalisePoint(position);

        const existingObject = frameArray[normalisedPosition.x][normalisedPosition.y];
        if (existingObject === null) {
            return {
                x: 0,
                y: 0
            }
        }

        if (frameCount - existingObject > DECAY_COUNT) {
            return {
                x: 0,
                y: 0
            }
        }


        return {
            // Remember that the additional delta is additive
            // So if we want to reverse direction we need to double * -1  the existing value
            x: (currentDelta.x + OBJECT_BOUNCE_ADD) * -1 * (1 + OBJECT_BOUNCE_MULTIPLY),
            y: (currentDelta.y + OBJECT_BOUNCE_ADD) * -1 * (1 + OBJECT_BOUNCE_MULTIPLY)
        }
    }

    function normalisePoint(point: XYPair): XYPair {


        return {
            x: Math.floor(point.x * N_CELLS),
            y: Math.floor(point.y * N_CELLS),
        }
    }

    function denormalisePoint(point: XYPair): XYPair {
        return {
            x: point.x / N_CELLS,
            y: point.y / N_CELLS
        }
    }



    return async function predictWebcam() {

        const worldObjects: Array<WorldObjects> = [];

        if(debugCtx){
            debugCtx.clearRect(0, 0, debugCanvas?.width ?? 0, debugCanvas?.height ?? 0);
        }


        // Now let's start detecting the stream.
        const startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;
            faceResults = faceLandmarker.detectForVideo(video, startTimeMs);
            handResults = handLandmarker.detectForVideo(video, startTimeMs);
            faceDetectorResults = faceDetector.detectForVideo(video, startTimeMs);
        }

        if (handResults) {


            if (debugDrawingUtils) {
                drawHandLandmarks(handResults, debugDrawingUtils);
            }

            for (const landmarks of handResults.landmarks) {
                worldObjects.push({
                    type: "hand",
                    x: landmarks[0].x,
                    y: landmarks[0].y
                });
            }
        }

        faceResults && debugDrawingUtils && drawFaceLandmarks(faceResults, debugDrawingUtils);

        if (faceDetectorResults?.detections) {
            faceDetectorResults.detections.forEach((v) => {
                worldObjects.push({
                    type: "face",
                    x: v.keypoints[0].x,
                    y: v.keypoints[0].y,
                });
            })
        }


        worldObjects.forEach((v) => {

            const point = normalisePoint(v);
            frameArray[point.x][point.y] = frameCount;


        });


        const debug = [] as Array<unknown>;
        debug.push({ frameCount })

        drawFn(worldObjects.map((v) => {
            return {
                x: v.x,
                y: v.y,
                color: v.type === "face" ? "red" : "blue"
            }
        }));


        const newBallPosition = ballFunction(ballDeltaFn);
        drawFn([{ ...newBallPosition, color: "rgba(255, 255, 255)" }])

        debugCallback?.(debug)

        // Call this function again to keep predicting when the browser is ready.
        frameCount++;
        window.requestAnimationFrame(predictWebcam);

    }
}
