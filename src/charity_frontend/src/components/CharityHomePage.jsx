import React from "react";
import { OrbitControls, Html} from "@react-three/drei";
import Carousel from "./Carousel/Carousel";


function CharityHomePage(){
    
    return (
        <>
            <OrbitControls enableZoom={false} enableRotate={false} enablePan={false}/>
            <ambientLight intensity={0.5}/>
            <directionalLight intensity={1} position={[3,3,3]}/>
            <Carousel/>      
        </>
    );
}

export default CharityHomePage;