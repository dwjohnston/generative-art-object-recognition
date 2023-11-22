import { FaceDetector, FaceLandmarker, HandLandmarker, ObjectDetector, PoseLandmarker } from "@mediapipe/tasks-vision";



type MediapipeModels = {
    faceLandmarker: FaceLandmarker,
    handLandmarker: HandLandmarker,
    faceDetector: FaceDetector,
    objectDetector: ObjectDetector, 
    poseLandmaker: PoseLandmarker,
}

export type AbstractAlgorithmInput = {
    /**
     * The source video for controlling inputs
     */
    video: HTMLVideoElement,

    /**
    *  The main canvas output
     */
    artCanvas: HTMLCanvasElement,

    /**
     * Optional debug canvas
     */
    debugCanvas?: HTMLCanvasElement,

    /**
     * Mediapipe models
     */
    mediapipe: MediapipeModels; 


    /**
     * Optional function provide debug information to the rest of the application
     * @param value 
     * @returns 
     */
    debugCallback?: (value: unknown) => void
}

/**
 * A function that should be called once, and then returns a recursive animation loop function
 */
export type AbstractAlgorithm = (input: AbstractAlgorithmInput) =>  () => void; 