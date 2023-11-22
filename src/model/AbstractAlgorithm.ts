import { FaceDetector, FaceLandmarker, HandLandmarker } from "@mediapipe/tasks-vision";

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
    faceLandmarker: FaceLandmarker,
    handLandmarker: HandLandmarker,
    faceDetector: FaceDetector,

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