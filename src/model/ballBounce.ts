
export type XYPair = {
    x: number; 
    y: number; 
}

type BallBounceOptions = {
    /**
     * Initial position
     */
    initialPosition?: XYPair, 
    /**
     * Initial movement
     */
    initialDelta?: XYPair
    /**
     * Delta to add every frame tick
     */
    gravity?: XYPair, 
    /**
     * Affects how the delta changes when the ball hits the walls 
     */
    elasticity?: XYPair
}


const DEFAULT_BALL_OPTIONS : Required<BallBounceOptions> = {
    initialPosition: {
        x: 0.5, 
        y:0, 
    }, 
    initialDelta: {
        x: 0.05, 
        y: 0
    }, 
    gravity: {
        x: 0, 
        y: 0.01
    }, 
    elasticity: {
        x: 0.95, 
        y: 0.95,
    }

}
/**
 * Either a straight XY value, or a function that takes the current position an returns an XY value. 
 */
type AdditionalDelta = XYPair| ((currentPosition: XYPair, currentDelta: XYPair) => XYPair)

type BallBounceFunction = (additionalDelta?: AdditionalDelta)  =>  XYPair; 

export function createBallBounce(options?: BallBounceOptions) : BallBounceFunction {

    const mergedOptions = {
        ...DEFAULT_BALL_OPTIONS, 
        ...options
    }; 



    let currentX = mergedOptions.initialPosition.x; 
    let currentY = mergedOptions.initialPosition.y; 

    let currentDeltaX = mergedOptions.initialDelta.x; 
    let currentDeltaY = mergedOptions.initialDelta.y; 

    const gravityX = mergedOptions.gravity.x
    const gravityY = mergedOptions.gravity.y; 

    const elasticityX = mergedOptions.elasticity.x; 
    const elasticityY = mergedOptions.elasticity.y; 

    return (additionalDelta)  => {

        // Add gravity
        currentDeltaX += gravityX; 
        currentDeltaY += gravityY; 


        // And any changes from function args, if any
        if(additionalDelta){
            let additionalDeltaToUse : {x: number; y: number}; 
            if(typeof additionalDelta === "function"){
                additionalDeltaToUse = additionalDelta({x:currentX, y: currentY}, {x: currentDeltaX, y: currentDeltaY}); 
            }
            else {
                additionalDeltaToUse = additionalDelta;
            }

            currentDeltaX += additionalDeltaToUse.x; 
            currentDeltaY += additionalDeltaToUse.y; 
        }


        

        // Update position
        currentX += currentDeltaX; 
        currentY += currentDeltaY; 


        // If it hits the wall then reverse the delta for that direction
        if(currentX <0){
            currentX = 0; 
            currentDeltaX *= elasticityX * -1; 
        }
        if(currentX >1){
            currentX = 0.9999; 
            currentDeltaX *= elasticityX * -1; 
        }

        if(currentY <0){
            currentY = 0; 
            currentDeltaY *= elasticityX * -1; 
        }
        if(currentY >1){
            //0.9999 so it's still visible
            currentY = 0.9999; 
            currentDeltaY *= elasticityY * -1; 
        }

        return {
            x: currentX, 
            y: currentY
        }
    }
}