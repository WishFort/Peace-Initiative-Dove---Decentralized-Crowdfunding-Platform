import { ScreenSizer, useScroll } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState, useRef} from "react";
import * as THREE from "three";

function Item(props){

    const {size, viewport} = useThree();
    const [isMobile, setIsMobile] = useState();
    const itemRef = useRef();

    const {width, height, ratio} = useMemo(() => {
        let width = 4;
        let height = 4;
        let fillPercent = 0.2;

        let ratio = viewport.height / (height/fillPercent);

        if(viewport.width < viewport.height){
            ratio = viewport.width / (width/fillPercent);
        }

        return {width, height, ratio}
    }, []);

    return(
        <mesh 
        ref={itemRef}
        onPointerEnter={() => {
            document.body.style.cursor="pointer";
        }}
        onPointerLeave={() => {
            document.body.style.cursor="default";
        }}
        position={props.position}
        rotation={props.rotation}
        >
            <planeGeometry args={[width * ratio, height * ratio, 32, 32]}/>
            <meshStandardMaterial map={props.map} side={THREE.DoubleSide}/>
        </mesh>
    )
}

export default Item;