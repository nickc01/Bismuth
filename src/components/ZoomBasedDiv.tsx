import { Dispatch, MutableRefObject, SetStateAction, useEffect, useState } from "react";


let globalZoomAmount = 1;


interface ZoomCallbacks {
    [key: string]: Dispatch<SetStateAction<number>>
}


let callbacks: ZoomCallbacks = {};

let windowHooked = false;



//let zoomableElements: MutableRefObject<HTMLElement>[] = [];

/*export function AddZoomBasedElement(element: MutableRefObject<HTMLElement>) {
    if (zoomableElements.indexOf(element) < 0) {
        zoomableElements.push(element);
        if (element.current) {
            element.current.style.
        }
    }
}

export function RemoveZoomBasedElement(element: MutableRefObject<HTMLElement>) {

}*/



export interface ZoomBasedAreaProps {
    children: any,
    mainClass?: string,
    transformOrigin?: string
}

//This is primarily used for IOS zooming
export default function ZoomBasedDiv({ children, mainClass, transformOrigin }: ZoomBasedAreaProps) {
    const [zoom, setZoom] = useState(1);
    const [zoomID, setZoomID] = useState(crypto.randomUUID());

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


    return <div className={mainClass} style={{ transformOrigin: transformOrigin, transform: `scale(${zoom})` }}>
        {children}
    </div>
}