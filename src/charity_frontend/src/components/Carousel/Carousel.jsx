
import React, {useState, useRef} from "react";
import { useScroll, useTexture } from "@react-three/drei";
import Item from "./Item";
import { useFrame } from "@react-three/fiber";

const charityLogos = [
    "/charity_test_pic/Habitat_For_Humanity.png",
    "/charity_test_pic/Team_water_logo.png",
    "/charity_test_pic/UNICEF.png",
    "/charity_test_pic/WWF.png"
];

function Carousel(){
    const textures = useTexture(charityLogos);
    const [isDragging, setIsDragging] = useState(false);
    const [rotation, setRotation] = useState(0);
    const groupRef = useRef();
    const rotationRef = useRef(0);
    const targetRotationRef = useRef(0);
    const radius = 5;

    const angleStep = (Math.PI * 2) / textures.length;

    // mouse button/finger is lifted up
    function handlePointerUp(event){
        setIsDragging(false);
        event.target.releasePointerCapture(event.pointerId);    
        
        snapToNearestCard();
    }

    // mouse button/finger is pressed down
    function handlePointerDown(event){
        setIsDragging(true);
        event.stopPropagation();
        event.target.setPointerCapture(event.pointerId);

    }

    function handlePointerMove(event){
        if(isDragging){
            const deltaX = event.movementX || 0;
            rotationRef.current += deltaX * 0.005;
            targetRotationRef.current = rotationRef.current;
        }
    }

    function snapToNearestCard(){
        const currRotation = rotationRef.current;
        const normalizedRotation = currRotation % (Math.PI * 2); // what angle left over after 360*

        // get index of card, that is closest to normalizedRotation 0-360, per angle step
        // anglestep=360/4 => 90, so number can be closest to 90, 180, 270, or 360 indexes
        // ex: 180/90 =2
        const closestCardInd = Math.round(normalizedRotation/angleStep);
        
        // get angle of closest card 
        const targetRotation = closestCardInd * angleStep;


        // how much needed to rotate to get to target
        const rotationDifference = targetRotation - normalizedRotation;

        // final abs position needed to rotate
        let adjustedTarget = targetRotation + rotationDifference;

        // prevent having to move crazy distances when moving from 350 to 10
        // when completing circular rotation
        if(Math.abs(rotationDifference) > Math.PI){
            // ex: if Math.abs(-340)
            // rotDiff < 0 => rotDif + 360 , -340 + 360 = 20*
            //
            adjustedTarget = currRotation + (rotationDifference > 0 ? rotationDifference - (Math.PI * 2) : rotationDifference + (Math.PI*2));

        }

        targetRotationRef.current = adjustedTarget;
    }

    useFrame(() => {
        if(groupRef.current){
            const difference = targetRotationRef.current - rotationRef.current;
            
            if(Math.abs(difference) > 0.001){
                rotationRef.current += difference * 0.1;
            } else{
                rotationRef.current = targetRotationRef.current;
            }

            groupRef.current.rotation.y = rotationRef.current;
        }
    });



    return (
        <group
            ref={groupRef} 
            position={[0,0,-1.5]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
        >
            {textures.map((texture, i) => {
                const angle = (i/textures.length) * (Math.PI*2);
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                return (<Item
                    key={i}
                    map={texture}
                    position={[x, 0, z]}
                    rotation={[0,angle + Math.PI/2, 0]}
                />);
            })}
        </group>
    );
}

export default Carousel;