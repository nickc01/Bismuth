import { Dispatch, SetStateAction, useEffect, useState } from "react";


let globalZoomAmount = 1;

interface ZoomCallbacks {
    [key: string]: Dispatch<SetStateAction<number>>
}

let callbacks: ZoomCallbacks = {};

let windowHooked = false;

export interface ZoomBasedAreaProps {
    children: any,
    mainClass?: string,
    transformOrigin?: string,
    extraTransforms?: string
}

//This is primarily used for IOS zooming
export default function ZoomBasedDiv({ children, mainClass, transformOrigin, extraTransforms }: ZoomBasedAreaProps) {
    const [zoom, setZoom] = useState(1);
    const [zoomID, _] = useState(crypto.randomUUID());

    if (zoom !== globalZoomAmount) {
        setZoom(globalZoomAmount);
    }

    useEffect(() => {
        callbacks[zoomID] = setZoom;

        if (!windowHooked) {
            windowHooked = true;
            window.addEventListener("scroll", e => {
                console.log("ZOOMING");
                globalZoomAmount = window.innerWidth / document.documentElement.clientWidth;

                let keys = Object.keys(callbacks);

                for (let i = 0; i < keys.length; i++) {
                    callbacks[keys[i]](globalZoomAmount);
                }

            });
        }

        return () => {
            delete callbacks[zoomID];
        }
    }, [zoomID]);


    return <div className={mainClass} style={{
        backfaceVisibility: "hidden", transformOrigin: transformOrigin, transform: `translateZ(0) perspective(1px) ${extraTransforms ?? ""} scale(${zoom})` }}>
        {children}
    </div>
}