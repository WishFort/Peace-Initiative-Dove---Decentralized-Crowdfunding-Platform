import React, { useEffect } from "react";
import { OrbitControls, Html} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import WrappedCarousel from "./Carousel/CarouselHorizontal";


function CharityHomePage(){


    return (
        <>

            <OrbitControls enableZoom={false} enableRotate={false} enablePan={false}/>
            <ambientLight intensity={0.5}/>
            <directionalLight intensity={1} position={[3,3,3]}/>
            <WrappedCarousel/>   
        </>
    );
}

export default CharityHomePage;