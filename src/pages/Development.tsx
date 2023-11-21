
import { useRef } from 'react';
import { useTheWholeThing } from '../model/theWholeThing';

const SIZE = 400; 

export function Development() {
  const webCamVideoRef = useRef<HTMLVideoElement>(null);
  const artCanvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  useTheWholeThing(artCanvasRef, webCamVideoRef, debugCanvasRef);

  return <div className="development">
      <div className="video-container">
          <video autoPlay playsInline ref={webCamVideoRef} width={SIZE} height={SIZE}></video>
          <canvas className="output_canvas" ref={artCanvasRef} width={SIZE} height={SIZE}></canvas>
          <canvas className="debug_canvas" ref={debugCanvasRef} width={SIZE} height={SIZE}></canvas>
      </div>
  </div>
}

