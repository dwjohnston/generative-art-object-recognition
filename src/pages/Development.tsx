
import { useMemo, useRef } from 'react';
import { useTheWholeThing } from '../model/theWholeThing';

const SIZE = 400; 

export function Development() {
  const webCamVideoRef = useRef<HTMLVideoElement>(null);
  const artCanvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  useTheWholeThing(artCanvasRef, webCamVideoRef, debugCanvasRef);

  const {isHideCam, isHideDebug} = useMemo(() => {
    const params = new URL(document.location.toString()).searchParams;
    const isHideCam = params.get("hideCam") === 'true';
    const isHideDebug = params.get('hideDebug') === 'true'; 

    return {
      isHideCam, isHideDebug
    }

  }, []); 

  return <div className="development">
      <div className="video-container">
          <video autoPlay playsInline ref={webCamVideoRef} width={SIZE} height={SIZE} className={`${isHideCam ? 'hidden' : ''}`}></video>
          <canvas className="output_canvas" ref={artCanvasRef} width={SIZE} height={SIZE}></canvas>
          <canvas ref={debugCanvasRef} width={SIZE} height={SIZE} className={`debug_canvas ${isHideDebug ? 'hidden' : ''}`}></canvas>
      </div>
  </div>
}

