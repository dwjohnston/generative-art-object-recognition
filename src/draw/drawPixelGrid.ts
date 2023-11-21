


type ColorPoint = {
    /**
     * A position from 0-1 
     * The function will normalise this to a pixel
     */
    x: number; 
    /**
     * A position from 0-1 
     * The function will normalise this to a pixel
     */
    y: number; 
    color: string; 
}






export function createDrawpixelGridFunction(canvas: HTMLCanvasElement, nXCells: number, nYCells: number, opacity: number ) {


    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D; 
    if(!ctx){
        throw new Error("2d context did not exist");
    }

    const canvasWidth = canvas.width; 
    const canvasHeight = canvas.height; 

    const cellWidth = Math.floor(canvasWidth/nXCells);
    const cellHeight = Math.floor(canvasHeight/nYCells); 

    ctx.fillStyle = "rgba(1,1,1,1)"; 
    ctx.fillRect(0,0, canvasWidth, canvasHeight);



    function normaliseColorPoint(cp: ColorPoint) : ColorPoint {
        return {
            x: Math.floor(cp.x * nXCells), 
            y: Math.floor(cp.y * nYCells), 
            color: cp.color, 
        }
    }

    return (colorPoints: Array<ColorPoint>) => {
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`; 
        ctx.fillRect(0, 0, canvasWidth, canvasHeight); 


        const buckets: Record<string, Array<ColorPoint>> = {}; 

        /**
         * An optimisation so we don't have to change the fill style for every point
         */
        colorPoints.forEach((v) => {
            if(!buckets[v.color]){
                buckets[v.color] =[];
            }
            buckets[v.color].push(v);
        }); 


        Object.entries(buckets).forEach((v) => {
            const [color, array] = v; 

            ctx.fillStyle=color; 
            array.forEach((cp) => {

                const normalisedCp = normaliseColorPoint(cp);
                const xStart = normalisedCp.x * cellWidth; 
                const yStart = normalisedCp.y  * cellHeight; 
                
                ctx.fillRect(xStart, yStart, cellWidth, cellHeight);
            }); 
        })
    }

}