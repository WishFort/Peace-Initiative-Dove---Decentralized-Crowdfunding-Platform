import React, {useMemo} from "react";
import * as THREE from "three";
import { useCarousel } from "./Context";
import { shaderMaterial } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

function CarouselItem(props) {

    const {settings}=useCarousel();
    const {width, height} = settings;

    const {viewport}= useThree();

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
                    vUv=(uv-vec2(0.5))*0.6+vec2(0.5);
                }

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
            fragmentShader
        }
    },[]);

    return(
        <group>
            <mesh position={[0,0,-10]}>
                <planeGeometry args={[width, height, 32, 32]}/>
                <shaderMaterial args={[shaderArgs]}/>           
            </mesh>
        </group>
    )
}

export default CarouselItem;