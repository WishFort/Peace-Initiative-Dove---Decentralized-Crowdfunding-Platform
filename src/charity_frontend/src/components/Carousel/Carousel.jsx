
import React, {useState, useRef, useEffect} from "react";
import { useCursor, useScroll, useTexture } from "@react-three/drei";
import Item from "./Item";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const charityLogos = [
    "/charity_test_pic/Helper_Foundation.png",
    "/charity_test_pic/GiveWell.png",
    "/charity_test_pic/GiveDirectly.png",
    "/charity_test_pic/TuringTrust.png",
    "/charity_test_pic/Rainforest_Foundation_US.png",
    "/charity_test_pic/FreedomOfPress.png",
    "/charity_test_pic/WWF.png",
    "/charity_test_pic/WWF.png",
    "/charity_test_pic/WWF.png"
];

function Carousel(){
    const textures = useTexture(charityLogos);
    const groupRef = useRef();
    const rotationRef = useRef(0);
    const targetRotationRef = useRef(0);
    const isSnapRef = useRef(false);
    const isDraggingRef = useRef(false);
    const radius = 5;

    const {camera} = useThree();
    const [currentIndex, setCurrentIndex] = useState(0);

   

    const angleStep = (Math.PI * 2) / textures.length;

    // mouse button/finger is lifted up
    function handlePointerUp(event){
        isDraggingRef.current = false;
        event.target.releasePointerCapture(event.pointerId);    
        snapToNearestCard();
    }

    // mouse button/finger is pressed down
    function handlePointerDown(event){
        isDraggingRef.current = true;
        event.stopPropagation();
        event.target.setPointerCapture(event.pointerId);

    }

    function handlePointerMove(event){
        if(isDraggingRef.current){
            //
            //event.preventDefault();
          
            const deltaX = event.movementX || 0;
            rotationRef.current += deltaX * 0.002;

            targetRotationRef.current = rotationRef.current;
        
        }
    }

    function snapToNearestCard(){
        isSnapRef.current = true;
        const currRotation = rotationRef.current;
        console.log("Current Rotation is:", THREE.MathUtils.radToDeg(currRotation));
        // add Math.PI/2 to make currRotation always positive
        // ex: -x rotation
        // (-x + 2pi)%Math.PI*2 => range [0, 2pi]
        // never - normalizedRotation
        // + Math.PI*2 used to get positive roatations withing [0,2pi], so that negative angles preserver their rotations but are positive through the adition of Math.PI*2
        const normalizedRotation = ((currRotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI*2); // what angle left over after 360*

        // get index of card, that is closest to normalizedRotation 0-360, per angle step
        // anglestep=360/4 => 90, so number can be closest to 90, 180, 270, or 360 indexes
        // ex: 180/90 =2
        // % textures.length in order to ensure closest card index is [0, textures.length -1]
        const closestCardInd = Math.round(normalizedRotation/angleStep) % textures.length;
        
        setCurrentIndex(closestCardInd);

        console.log("Closest Card Index:", closestCardInd);
        console.log("Angle Step Is:", THREE.MathUtils.radToDeg(angleStep));

        // get angle of closest card 
        const targetRotation = closestCardInd * angleStep;


        // how much needed to rotate to get to target
        let rotationDifference = targetRotation - normalizedRotation;


        // prevent having to move crazy distances when moving from 350 to 10
        // when completing circular rotation
        if(Math.abs(rotationDifference) > Math.PI){
            // ex: if Math.abs(-340)
            // rotDiff < 0 => rotDif + 360 , -340 + 360 = 20*
            // rotDiff >0 => rotDif -360, 340 -360 = -20 move -20 go the shortest path
            if(rotationDifference > 0){
                rotationDifference -= (Math.PI * 2);
            } else {
                rotationDifference += (Math.PI * 2);
            }
        }

         // final abs position needed to rotate
        let adjustedTarget = currRotation + rotationDifference;



        targetRotationRef.current = adjustedTarget;
        isSnapRef.current = false;
        /*console.log("Target Rotation Ref is:", THREE.MathUtils.radToDeg(adjustedTarget));
        // 90, 180, 270, 360
        console.log("Normalized rotation:", THREE.MathUtils.radToDeg(normalizedRotation));
        console.log("Adjusted Target", THREE.MathUtils.radToDeg(adjustedTarget));
        console.log("Current Rotation", THREE.MathUtils.radToDeg(currRotation));
        console.log("Current Card Index", closestCardInd);
        console.log("Rotation difference", THREE.MathUtils.radToDeg(rotationDifference));
        console.log("Target rotation", THREE.MathUtils.radToDeg(targetRotation));*/
    }


    useFrame(() => {
        if(groupRef.current){
            if(isDraggingRef.current){
                groupRef.current.rotation.y = rotationRef.current;

            } else {
                const difference = targetRotationRef.current - rotationRef.current;
    
                if(Math.abs(difference) > 0.0000001){
                    // interpolate to target rotation, prevent hard snapping towards targetRotationRef.current
                    rotationRef.current += difference * 0.1; // esssentially when not snapped target and dragging
                } else{
                    rotationRef.current = targetRotationRef.current;
                }

                groupRef.current.rotation.y = rotationRef.current;
                
            }
                
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
                    cardIndex={i}
                    currentIndex={currentIndex}
                />);
            })}
        </group>
    );
}

export default Carousel;