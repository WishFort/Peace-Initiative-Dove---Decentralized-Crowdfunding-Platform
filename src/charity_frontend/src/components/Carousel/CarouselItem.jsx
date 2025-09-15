import React, {useEffect, useMemo, useState} from "react";
import * as THREE from "three";
import { useCarousel } from "./Context";
import { shaderMaterial, useCursor, Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { formatSatoshi } from "./CarouselHorizontal";

function CarouselItem(props) {

    const {settings, setActiveIndex, activeIndex}=useCarousel();
    const [isActive, setIsActive] = useState(false);
    const [isClosedActive, setIsClosedActive] = useState(false);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);
    const {width, height} = settings;

    const {viewport}= useThree();
    
    const [raisedAmount, setRaisedAmount] = useState(0);

    const satAmount = props.index * 50_000;
    const formattedSatAmount = formatSatoshi(satAmount).split(" ")[0];

    useState(() => {
        
    }, []);

    useEffect(() => {
        setIsActive(activeIndex==props.index);
        if(activeIndex === props.index){
            setIsClosedActive(false);
        } else {
            setIsClosedActive(true);
        }
    }, [activeIndex]);

    const shaderArgs=useMemo(() => {
        const uniforms={
            uTex: {value: props.texture},
            uGrayOverlay: {value: new THREE.Vector4(0,0,0,0)},
            uTime: {value: 0},
            uScrollSpeed: {value: 0},
            uDistance: {value: 0},
            uProgress: {value: 0},
            uEnableParallax: {value: settings.enableParallax},
            uEnableFloating: {value: settings.enableFloating},
            uZoomScale:{
                value: {x:viewport.width/width, y: viewport.height/height}
            },
            uIsActive:{value: false}
        };
        
        gsap.to(uniforms.uProgress, {
            value: isActive ? 1 : 0,
            duration: 1,
            ease: "power3.out"
        });
        // GPU handles vertex & fragment shader for each pixel in parallel


        const vertexShader= /*glsl*/`
            varying vec2 vUv;
            uniform float uTime;
            uniform float uDistance;
            uniform float uScrollSpeed;
            uniform vec2 uZoomScale;
            uniform float uProgress;
            uniform bool uIsActive;
            uniform bool uEnableParallax;
            uniform bool uEnableFloating;
            float PI=3.14159265359;

            void main() {
                vUv=uv;
                vec3 pos = position;
                if(!uIsActive && uEnableFloating){
                    // complete cycle every 2 seconds
                    pos.y += sin(PI*uTime) * 0.2;
                }

                pos.y += sin(PI * vUv.x) * uScrollSpeed;
                pos.z += cos(PI * vUv.y) * uScrollSpeed;

                if(uEnableParallax){
                    vec2 offset = (vUv - vec2(0.5)); // calculate distance of UV coordinate from center
                    vUv=offset*0.7+vec2(0.5); // multiply distance by 0.6 to push the pixel closer to center, and add vec2 0.5 to convert back to UV range
                    vUv += offset * uDistance * 0.3;
                }

                // animation for active
                float angle=uProgress*PI/2.0;
                float wave=cos(angle);
                float c=sin(length(vUv-vec2(0.5)*PI)*15.0+uProgress*12.0)*0.5+0.5;
                pos.x*=mix(1.0, uZoomScale.x+wave*c, uProgress);
                pos.y*=mix(1.0, uZoomScale.y+wave*c, uProgress);

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `
        const fragmentShader= /*glsl*/ `
            varying vec2 vUv;
            uniform sampler2D uTex;
            uniform vec4 uGrayOverlay;

            void main(){

                // get colors for each pixel at UV coordinate
                // apply interpolation if needed
                vec3 textureColor = texture2D(uTex, vUv).rgb;

                // opacity of gray=how much of original image to gray out
                textureColor=mix(textureColor, uGrayOverlay.rgb, uGrayOverlay.a);

                gl_FragColor= vec4(textureColor,1.0);
            }
        `

        return {
            uniforms,
            vertexShader,
            fragmentShader,
        }
    },[isActive]);

    const {scaleFactor, isMobile} = useMemo(() => {
        const baseWidth = 1920;
        const baseHeight = 1080;

        return {
            scaleFactor: Math.min(viewport.width/baseWidth, viewport.height/baseHeight),
            isMobile: viewport.width < viewport.height
        }
    }, [viewport.width, viewport.height])

    return(
        <group
            scale={scaleFactor}
            onClick={() => {
                if(isActive){
                    setActiveIndex(null);
                } else {
                    setActiveIndex(props.index);
                }
                props.resetShowDonateState();
            }}
             onPointerEnter={() => setHovered(true)}
             onPointerLeave={() => setHovered(false)}
           
        >
            <mesh position={[isMobile ? -1 : 0,isMobile && isActive ? 5000 : 0,-10]}>
                <planeGeometry args={[width * (isMobile ? 0.75 : 1), height * (isMobile ? 0.75 : 1), 32, 32]}/>
                <shaderMaterial args={[shaderArgs]}/>           
            </mesh>
            {props.index == props.centerIndex && activeIndex == null && <Html position-x={isMobile ? -0.75 : -4}>
                <div className="supporting-text-charity">
                    {formattedSatAmount}
                </div>
            </Html>}
        </group>
    )
}

export default CarouselItem;