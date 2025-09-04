import { ScreenSizer, useCursor, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState, useRef} from "react";
import * as THREE from "three";

function Item(props){

    const {size, viewport} = useThree();
    const [isMobile, setIsMobile] = useState();
    const {camera} = useThree();
    const itemRef = useRef();
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);

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

    useEffect(() => {
        if(itemRef.current){
            // card looks at origin
            // [0,0,0]
            itemRef.current.lookAt(0, itemRef.current.position.y, 0);
            itemRef.current.rotateY(Math.PI); 
        }
    }, []);

    return(
        <mesh 
        ref={itemRef}
        position={props.position}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        >
            <planeGeometry args={[width * ratio, height * ratio, 32, 32]}/>
            <meshStandardMaterial map={props.map} side={THREE.DoubleSide}/>
        </mesh>
    )
}

export default Item;