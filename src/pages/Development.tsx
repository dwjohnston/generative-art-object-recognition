
import { useMemo, useRef } from 'react';
import { useTheWholeThing } from '../model/theWholeThing';

import party from "../assets/party.mp4";
import subway from "../assets/subway.mp4";
import { ballHandInteraction } from '../model/algorithms/ballHandInteraction';

const map = {party, subway}
const SIZE = 400; 

export function Development() {
  const webCamVideoRef = useRef<HTMLVideoElement>(null);
  const artCanvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  useTheWholeThing({artCanvasRef, webCamVideoRef, debugCanvasRef, algorithm: ballHandInteraction});

  const {isHideCam, isHideDebug, videoSource} = useMemo(() => {
    const params = new URL(document.location.toString()).searchParams;
    const isHideCam = params.get("hideCam") === 'true';
    const isHideDebug = params.get('hideDebug') === 'true'; 
    const videoSource = params.get("videoSource") ?? "webcam"; 

    return {
      isHideCam, isHideDebug, videoSource
    }

  }, []); 

  return <div className="development">
      <div className="video-container">
          <video loop controls playsInline ref={webCamVideoRef} width={SIZE} height={SIZE} className={`${isHideCam ? 'hidden' : ''}`} muted src={map[videoSource]}></video>
          <canvas className="output_canvas" ref={artCanvasRef} width={SIZE} height={SIZE}></canvas>
          <canvas ref={debugCanvasRef} width={SIZE} height={SIZE} className={`debug_canvas ${isHideDebug ? 'hidden' : ''}`}></canvas>
      </div>
  </div>
}

