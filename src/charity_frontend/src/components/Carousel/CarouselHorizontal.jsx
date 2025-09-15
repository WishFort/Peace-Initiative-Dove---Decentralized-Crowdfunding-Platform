import React, {useEffect, useRef, useState} from "react";
import CarouselItem from "./CarouselItem";
import { Html, useCursor, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CarouselProvider, useCarousel } from "./Context";
import gsap from "gsap";

const charityLogos = [
    "/charity_test_pic/HSD_Logo.png",
    "/charity_test_pic/GW_Logo.png",
    "/charity_test_pic/GD_Logo.png",
    "/charity_test_pic/TT_Logo.png",
    "/charity_test_pic/RF_Logo.png",
    "/charity_test_pic/FOP_Logo.png",
];

function formatSatoshi(satAmount){
    if(typeof satAmount !== 'number' && isNaN(parseInt(satAmount))){
        return "error getting funds raised"
    }

    const value = Number(satAmount);
    if(value >= 1_000_000_000){
        return (value/1_000_000_000).toFixed(2) + "B sats";
    } else if(value >= 1_000_000){
        return (value/1_000_000_000).toFixed(2) + "M sats";
    } else if(value>1_000){
        return (value/1_000).toFixed(2) + "k sats";
    } else {
        return value + " sats";
    }
}

export {formatSatoshi}

function CarouselHorizontal() {
    const groupRef = useRef();
    const progressRef = useRef(0);
    const prevProgressRef=useRef(0);
    const scrollSpeedRef= useRef(0);
    const textures = useTexture(charityLogos);
    const {viewport} = useThree();
    const items = groupRef.current?.children || [];
    const totalItems = items?.length || 0;

    const [charityName, setCharityName] = useState("Freedom Of Press");
    const [charityDescription, setCharityDescription] = useState("[Charity Name] works to [mission] in [location]. Since [year], we've [key achievement/service]. Our programs focus on [main areas] to help [beneficiaries]. We've [impact statistic] and continue growing our reach. Your support through donations or volunteering helps us [specific impact]. Join us in [call to action]. [Tax-deductible/percentage to programs statement].");
    const [charityRaisedAmount, setCharityRaisedAmount] = useState(100_000);
    
    const [showDonate, setShowDonate] = useState();
    const [donationAmount, setDonationAmount] = useState(null);
    const [confirmText, setConfirmText] = useState("Confirm");
    

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(viewport.width < viewport.height);
    }, [viewport.width, viewport.height]);


    const {settings, activeIndex, setActiveIndex} = useCarousel();

    function handleWheel(e) {
        if(activeIndex !== null) return;

        const delta = e.deltaY * 0.2;
        let newProgress = progressRef.current + delta;

        // snapping to nearest item
        newProgress=Math.round(newProgress);
        newProgress= Math.max(0,Math.min(100, newProgress));
        progressRef.current = newProgress;
    }

    const [stateCenterIndex, setCenterIndex] = useState(0);
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
        if(stateCenterIndex != centerIndex){
            setCenterIndex(centerIndex);
        }

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
            item.visible = Math.abs(distance) <= 1; // only 3 items visible at a time
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
           
            const tl=gsap.timeline();
            const htmlOverlayLeft=activeIndex !== null ? (isMobile ? "0vw" : "-30vw") : "-100vw";
            const htmlOverlayOpacity = activeIndex !== null ? 1 : 0;
            if(!groupRef.current) return;
            tl.to(groupRef.current.rotation, {
                x: settings.rotation[0],
                y: settings.rotation[1],
                z: settings.rotation[2],
                duration: 0.8,
                ease: "power3.out"
            }).to(groupRef.current.position,{
                x:settings.position[0],
                y: settings.position[1],
                z: settings.position[2],
                duration: 0.8,
                ease: "power3.out" 
            }).to(htmlOverlayRef.current, {
                x:htmlOverlayLeft,
                opacity: htmlOverlayOpacity
            }, "<-0.3"); // <-0.3 seconds befor position interpolation finishes overlay starts

        })
    });

    const htmlOverlayRef=useRef();

    return (
        <>
         <Html center style={{pointerEvents: "none"}}>
            <div ref={htmlOverlayRef} className="outer-html-container absolute z-100 top-0 left-0 w-full"
                style={{transform: "translateX(-100vw)", opacity:0, pointerEvents: activeIndex !==null ? "auto": "none"}}
            >
              <div className="charity-info-container">
                <h1 className={"charity-name"}>{charityName}</h1>
                <div className={"charity-raised"}>Amount Raised: <span className="bold">{formatSatoshi(charityRaisedAmount)}</span></div>
                <div className={"charity-description"}>{charityDescription}</div>
              </div>
                <div className={`charity-button-container ${isMobile ? "mobile-charity-button-container-override": ""} `}>
                    <div className={`donate-button ${showDonate ? "donate-button-active" : ""}`} onClick={() => setShowDonate(true)}>Donate</div>
                </div> 
                {isMobile && activeIndex !== null &&  <div className="return-button-container">
                    <div className={"donate-button return-button-override"} onClick={() => setActiveIndex(null)}>Return Home</div>
                </div>}
            </div>
           
         </Html>
         {showDonate && activeIndex !== null &&  <Html center>
                <div className={"donate-container"}>
                    <div className="charity-raised donation-text-override">Donation</div>
                    <input  
                         type="number"
                         className="input-donation"
                         min="1"
                         placeholder="Amount in Satoshi"
                         value={donationAmount}
                         onChage={(e) => setDonationAmount(e.target.value)}
                        />
                    <div className="donate-button confirm-button-override">{confirmText}</div>

                </div>
         </Html>}
            <group
            >
                <mesh onWheel={handleWheel} position={[0,0,-0.01]}>
                    <planeGeometry args={[viewport.width, viewport.height]}/>
                    <meshBasicMaterial transparent opacity={0}/>
                </mesh>
                <group ref={groupRef}>
                    {textures.map((texture, i) => {
                        return(<CarouselItem texture={texture} centerIndex={stateCenterIndex} key={i} index={i} resetShowDonateState={() => setShowDonate(false)}/>);
                    })}
                </group>
            </group>
        </>
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