import { useEffect, useRef } from "react";
import { useTheWholeThing } from "../model/theWholeThing";
export function Production() {


    const webCamVideoRef = useRef<HTMLVideoElement>(null);
    const artCanvasRef = useRef<HTMLCanvasElement>(null);

    const containerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if(containerRef.current && artCanvasRef.current){
            artCanvasRef.current.width = containerRef.current.clientWidth; 
            artCanvasRef.current.height = containerRef.current.clientHeight;
        }
    },[])


    useTheWholeThing(artCanvasRef, webCamVideoRef);

    return <div className="production">
        <div className="video-container" ref={containerRef}>
            <video autoPlay playsInline ref={webCamVideoRef}></video>
            <canvas className="output_canvas" ref={artCanvasRef}></canvas>
        </div>
    </div>
}