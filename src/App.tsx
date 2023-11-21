
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Development } from './pages/Development';
import { Production } from './pages/Production';
import { Remote } from './pages/Remote';


type Modes = 'development' | 'remote' | 'production'; 

function App(){

  const mode = useMemo(() => {
    const params = new URL(document.location.toString()).searchParams;
    const mode = params.get("mode");
    return mode ?? "production";
  }, []); 

  return (
    <>
      <div className="video-container">
        {mode ==="development" && <Development/>}
        {mode ==="production" && <Production/>}
        {mode ==="remote" && <Remote/>}
      </div>
    </>
  )
}

export default App
