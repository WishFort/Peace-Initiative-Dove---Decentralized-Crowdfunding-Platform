import React from "react";
import {useProgress, Html} from "@react-three/drei";

function LoadingScreen(props)
{
    const {progress} = useProgress();

    return (
        <Html fullscreen>
        <div className = "loading_screen">
            <h1>Bleep!</h1>
            <div className="load-animation">
                <div className="bar bar1"></div>
                <div className="bar bar2"></div>
                <div className="bar bar3"></div>
                <div className="bar bar4"></div>
            </div>
            <p>Loading: {parseInt(progress)}%</p>
        </div>
        </Html>
    );
}

export default LoadingScreen;