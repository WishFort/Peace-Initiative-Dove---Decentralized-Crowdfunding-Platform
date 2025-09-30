import React, { createContext, useContext, useState, ReactNode, useEffect} from "react"
import { GROUP_POSITION_ACTIVE, GROUP_POSITION_DEFAULT, GROUP_ROTATION_ACTIVE, GROUP_ROTATION_DEFAULT, ITEM_GAP, planeSettings } from "./Settings"


interface CarouselSettings{
    width: number
    height: number
    rotation: [number, number, number]
    position: [number, number, number]
    itemGap : number
    enableParallax : boolean 
    enableFloating : boolean
}

interface CarouselContextType{
    activeIndex: number | null,
    setActiveIndex : React.Dispatch<React.SetStateAction<number | null>>,
    settings: CarouselSettings,
    isActive : boolean,
    toggleParallax: () => void 
    toggleFloating: () => void
}

const CarouselContext = createContext<CarouselContextType | null>(null);


export const useCarousel = () => {
  // get values from carousel provider on first render
  // provider sets values
  // access most recent values passed to CarouselContext.Provider props
    const context = useContext(CarouselContext);
    if(!context){
        throw new Error("useCarousel does not have a context");
    }

    return context;
}

export const CarouselProvider : React.FC<{children : ReactNode}> = ({children}) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [settings, setSettings] = useState<CarouselSettings>({
            width: planeSettings.height,
            height: planeSettings.height,
            rotation: GROUP_POSITION_DEFAULT,
            position: GROUP_POSITION_DEFAULT,
            itemGap : ITEM_GAP,
            enableFloating: true,
            enableParallax: true
    });

    const isActive = activeIndex !== null;
    const toggleParallax = () => {
        setSettings((prev) => ({...prev, enableParallax: !prev.enableParallax}));
    }

    const toggleFloating = () => {
        setSettings((prev) => ({...prev, enableParallax : !prev.enableFloating}));
    }

    let gui : dat.GUI;

    const initGUI = async () => {
        const dat = await import("dat.gui");
        if(gui) return;
        gui = new dat.GUI();
        const settingsFolder = gui.addFolder("Carousel Settings");
        
        // width
        settingsFolder.add(settings, "width", 0.5, 10, 0.1).name("Item Width").onChange(newVal => {
            setSettings((prev) => {
                return ({...prev,width: newVal});
            })
        })

       // height
         settingsFolder
      .add(settings, "height", 0.5, 10, 0.1)
      .name("Item Height")
      .onChange((newValue) => {
        setSettings((prev) => ({
          ...prev,
          height: newValue,
        }))
      })

    // rotation
    settingsFolder
      .add(settings.rotation, "0", -Math.PI, Math.PI, 0.01)
      .name("Rotation X")
      .onChange((newValue) => {
        setSettings((prev) => ({
          ...prev,
          rotation: [newValue, prev.rotation[1], prev.rotation[2]],
        }))
      })
    settingsFolder
      .add(settings.rotation, "1", -Math.PI, Math.PI, 0.01)
      .name("Rotation Y")
      .onChange((newValue) => {
        setSettings((prev) => ({
          ...prev,
          rotation: [prev.rotation[0], newValue, prev.rotation[2]],
        }))
      })
    settingsFolder
      .add(settings.rotation, "2", -Math.PI, Math.PI, 0.01)
      .name("Rotation Z")
      .onChange((newValue) => {
        setSettings((prev) => ({
          ...prev,
          rotation: [prev.rotation[0], prev.rotation[1], newValue],
        }))
      })

    // item gap
    settingsFolder
      .add(settings, "itemGap", 0, 10, 0.1)
      .name("Item Gap")
      .onChange((newValue) => {
        setSettings((prev) => ({
          ...prev,
          itemGap: newValue,
        }))
      })

    // parallax
    settingsFolder
      .add(settings, "enableParallax")
      .name("Enable Parallax")
      .onChange(() => {
        toggleParallax()
      })

    // floating
    settingsFolder
      .add(settings, "enableFloating")
      .name("Enable Floating")
      .onChange(() => {
        toggleFloating()
      })

     settingsFolder.open();
    }

    useEffect(() => {
      //initGUI();

      return () => {
        if(gui){
          gui.destroy();
        }
      }
    }, []);

    useEffect(() => {
      setSettings((prev) => {
        return  ({...prev, rotation: isActive ? GROUP_ROTATION_ACTIVE : GROUP_ROTATION_DEFAULT,
                           position: isActive ? GROUP_POSITION_ACTIVE : GROUP_POSITION_DEFAULT
        });
      })
    }, [isActive, activeIndex]);

    return (
      <CarouselContext.Provider
       value={{
        settings,
        activeIndex,
        setActiveIndex,
        isActive,
        toggleParallax,
        toggleFloating
       }}>
        {children}
       </CarouselContext.Provider>
    )
}