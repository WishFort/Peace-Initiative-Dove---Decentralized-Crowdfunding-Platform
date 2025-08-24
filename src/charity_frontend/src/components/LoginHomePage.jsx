
import {Canvas, useFrame, useThree} from "@react-three/fiber"; 
import React, { Suspense, useEffect, useRef } from "react";
import {Html, OrbitControls, Text3D, Text, Float, Center} from "@react-three/drei";
import { Cash } from "./Cash";
import { Peace } from "./Peace";
import LoginButton from "./LoginButton";

function LoginHomePage(props){

    const {size, viewport} = useThree();

    const baseWidth = 700;
    const scaleFactor = Math.min(1, size.width/baseWidth);

    const textScale= 0.2 * scaleFactor;

    // if width > height, then aspect > 1 10/5 = 2
    // if width < height, then aspect < 1 5/10 = 0.5
    const aspect = size.width / size.height;

    let yOffset;
    if(size.width < 480){
        yOffset = aspect < 1 ? 1 : Math.min(2.5, viewport.height * 0.2);
    } else{
        yOffset = aspect < 1 ? 1.5 : Math.min(2.5, viewport.height * 0.5);
    }

    console.log("Y offset is:", yOffset);

    return (
        <>
            <OrbitControls enableZoom={false} maxPolarAngle={Math.PI/1.5} minPolarAngle={Math.PI/3} maxAzimuthAngle={Math.PI/4} minAzimuthAngle={-Math.PI/4} enablePan={false}/>
            <ambientLight intensity={0.5}/>
            <directionalLight intensity={1} position={[3,3,3]}/>
            <Html center>
                <div className={"company-name-container"}>
                    <div className="no-select">Dove</div>
                    <div className={"subtext-company-name no-select"}>Decentralized Crowdfunding</div>
                    <LoginButton onAuth={props.onAuth}/>
                </div>
                
            </Html>
            <Float floatIntensity={1} speed={2}>
                <Cash scale={scaleFactor} position={[0,yOffset * 0.6, 0]}/>
            </Float>

            <Float floatIntensity={1} speed={1}>
                <Peace scale={0.5 * scaleFactor} position={[0,yOffset, 0]}/>
            </Float>

            <Text position={[0,-2.5,0]} scale={textScale}>
                {"Contribute to peace, aid charities, earn your share"}
                <meshStandardMaterial color={"white"}/>
            </Text>
        </>
    )
}

export default LoginHomePage;