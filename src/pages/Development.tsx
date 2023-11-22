
import { useMemo, useRef } from 'react';
import { useTheWholeThing } from '../model/theWholeThing';

import party from "../assets/party.mp4";
import subway from "../assets/subway.mp4";
import subway_front from "../assets/subway_front.mp4"; 
import crowd_top from "../assets/crowd_top.mp4"
import { ballHandInteraction } from '../model/algorithms/ballHandInteraction';
import { lines } from '../model/algorithms/lines';

const videoMap = {party, subway, subway_front, crowd_top}
const algorithmMap = {ballHandInteraction, lines}

const SIZE = 400; 

export function Development() {
  const webCamVideoRef = useRef<HTMLVideoElement>(null);
  const artCanvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);


  const {isHideCam, isHideDebug, videoSource, algorithm} = useMemo(() => {
    const params = new URL(document.location.toString()).searchParams;
    const isHideCam = params.get("hideCam") === 'true';
    const isHideDebug = params.get('hideDebug') === 'true'; 
    const videoSource = params.get("videoSource") ?? "webcam"; 
    const algorithm = params.get("algorithm") ?? "lines"; 


    return {
      isHideCam, isHideDebug, videoSource, algorithm
    }

  }, []); 

  useTheWholeThing({artCanvasRef, webCamVideoRef, debugCanvasRef, algorithm: algorithmMap[algorithm]});


  return <div className="development">
      <div className="video-container">
          <video loop controls playsInline ref={webCamVideoRef} width={SIZE} height={SIZE} className={`${isHideCam ? 'hidden' : ''}`} muted src={videoMap[videoSource]}></video>
          <canvas className="output_canvas" ref={artCanvasRef} width={SIZE} height={SIZE}></canvas>
          <canvas ref={debugCanvasRef} width={SIZE} height={SIZE} className={`debug_canvas ${isHideDebug ? 'hidden' : ''}`}></canvas>
      </div>
  </div>
}

