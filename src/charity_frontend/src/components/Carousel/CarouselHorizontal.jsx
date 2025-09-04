import React, {useRef} from "react";
import CarouselItem from "./CarouselItem";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CarouselProvider, useCarousel } from "./Context";
import gsap from "gsap";

const charityLogos = [
    "/charity_test_pic/Helper_Foundation.png",
    "/charity_test_pic/GiveWell.png",
    "/charity_test_pic/GiveDirectly.png",
    "/charity_test_pic/TuringTrust.png",
    "/charity_test_pic/Rainforest_Foundation_US.png",
    "/charity_test_pic/FreedomOfPress.png",
];

function CarouselHorizontal() {
    const groupRef = useRef();
    const progressRef = useRef(0);
    const prevProgressRef=useRef(0);
    const scrollSpeedRef= useRef(0);
    const textures = useTexture(charityLogos);
    const {viewport} = useThree();
    const items = groupRef.current?.children || [];
    const totalItems = items?.length || 0;

    const {settings, activeIndex} = useCarousel();

    function handleWheel(e) {
        if(activeIndex !== null) return;

        const delta = e.deltaY * 0.2;
        let newProgress = progressRef.current + delta;

        // snapping to nearest item
        newProgress=Math.round(newProgress);
        newProgress= Math.max(0,Math.min(100, newProgress));
        progressRef.current = newProgress;
    }

    useFrame(() => {
        const rawProgress = progressRef.current;
        const scrollSpeed = rawProgress - prevProgressRef.current;
        scrollSpeedRef.current = scrollSpeed;
        prevProgressRef.current = rawProgress;

        // clamp progress between 0 and 100
        // progress = 100 fully at the top
        // progress = 0 fully at the bottom
        const progress = Math.max(0, Math.min(100, rawProgress));

        // calculate center index & distance
        const fraction=(progress/100) * (totalItems-1);
        const centerIndex = Math.round(fraction);

        items.forEach((item, i) => {
            // if centerIndex=1
            // then i=0, 0-1=-1 distance = -1 * 9
            // then i=2, 2-1=1 distance=1*9
            const distance = i - centerIndex;
            // settings.height added to ensure items do not overlap
            // settings height-> distance between individual centers of items
            // half one time + half other item-> center to center creates non-overlay
            // item gap -> additional space
            const y = -distance * (settings.height + settings.itemGap);
            const z = Math.abs(distance) * 0.5; // z = 0 if center, z=0.5 if 1 above, further away from center larger - z
            const scale = distance === 0 ? 2.5 : 1.7; // larger scale for card at center
            item.visible = Math.abs(distance) <= 3; // only 3 items visible at a time
            if(activeIndex !== null){ // only show selected image when in select mode
                item.visible=activeIndex===i;
            }
            gsap.to(item.position, {
                x:0,
                y,
                z,
                duration: 2,
                ease: "power3.out",
            }); 
            
            gsap.to(item.scale, {
                x: scale,
                y: scale,
                z: scale,
                duration: 2,
                ease: "power3.out"     
            });

            const material=item.children[0].material;
            //animate uGrayOverlay
            gsap.to(material.uniforms.uGrayOverlay.value, {
                x: 0.7,
                y:0.7,
                z: 0.7,
                w: distance === 0 ? 0 : 0.7, //set opacity to 0 if on current progress card otherwise 0.7(blend factor for mix in shader material)
                duration: 2,
                ease: "power3.out"
            });

            // uDistance
            gsap.to(material.uniforms.uDistance, {
                value: Math.abs(distance) > 0 ? 1: 0, // if not on current card make it 1, otherwise 0
                duration: 2,
                ease: "power3.out"         
            });

            gsap.to(material.uniforms.uScrollSpeed, {
                value: scrollSpeed,
                duration: 2,
                ease: "power3.out" 
            });

            material.uniforms.uTime.value = performance.now() / 1000; // get seconds from page load
           

        })
    });

    return (
        <group>
            <mesh onWheel={handleWheel} position={[0,0,-0.01]}>
                <planeGeometry args={[viewport.width, viewport.height]}/>
                <meshBasicMaterial transparent opacity={0}/>
            </mesh>
            <group ref={groupRef}>
                {textures.map((texture, i) => {
                    return(<CarouselItem texture={texture} key={i} index={i}/>);
                })}
            </group>
        </group>
    )
}

function WrappedCarousel(){
    return (
    <CarouselProvider>
        <CarouselHorizontal/>    
    </CarouselProvider>
    );
}

export default WrappedCarousel;