import { Dispatch, SetStateAction, useEffect, useState } from "react";

// Global variable to store the zoom amount
let globalZoomAmount = 1;

// Interface to define the zoom callbacks
interface ZoomCallbacks {
    [key: string]: Dispatch<SetStateAction<number>>
}

// Object to store the zoom callbacks
let callbacks: ZoomCallbacks = {};

// Flag to track if the window event is hooked
let windowHooked = false;

// Props for the ZoomBasedDiv component
export interface ZoomBasedAreaProps {
    children: any,
    mainClass?: string,
    transformOrigin?: string,
    extraTransforms?: string
}

// Component used for zoom-based transformations, primarily for iOS zooming
export default function ZoomBasedDiv({ children, mainClass, transformOrigin, extraTransforms }: ZoomBasedAreaProps) {
    // State to track the zoom value
    const [zoom, setZoom] = useState(1);
    // Generate a random zoom ID
    const [zoomID, _] = useState(crypto.randomUUID());

    // If the zoom value is not equal to the globalZoomAmount, update the zoom state
    if (zoom !== globalZoomAmount) {
        setZoom(globalZoomAmount);
    }

    useEffect(() => {
        // Store the setZoom function in the callbacks object using the zoomID as the key
        callbacks[zoomID] = setZoom;

        if (!windowHooked) {
            // Hook the window scroll event only once
            windowHooked = true;
            window.addEventListener("scroll", e => {
                console.log("ZOOMING");
                // Calculate the globalZoomAmount based on the window width and document width
                globalZoomAmount = window.innerWidth / document.documentElement.clientWidth;

                let keys = Object.keys(callbacks);

                // Call each callback function in the callbacks object with the updated globalZoomAmount
                for (let i = 0; i < keys.length; i++) {
                    callbacks[keys[i]](globalZoomAmount);
                }
            });
        }

        return () => {
            // Remove the zoom callback from the callbacks object on component unmount
            delete callbacks[zoomID];
        }
    }, [zoomID]);

    return (
        <div
            className={mainClass}
            style={{
                backfaceVisibility: "hidden",
                transformOrigin: transformOrigin,
                transform: `translateZ(0) perspective(1px) ${extraTransforms ?? ""} scale(${zoom})`
            }}
        >
            {children}
        </div>
    );
}
