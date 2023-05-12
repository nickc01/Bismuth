import { useCallback, useEffect, useRef } from "react";
import styles from "../../styles/ZoomControls.module.css";
//import { clamp } from "../global";


export interface ZoomControlsProps {
    onZoom: (zoomDiff: number) => void
}

export default function ZoomControls({ onZoom }: ZoomControlsProps) {

    //const elementRef = useRef(null as HTMLElement);
    //const zoomAmount = useRef(1);

    /*const onMouseWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        setZoom(zoomAmount.current - (e.deltaY / 400));
    }, []);*/

    const increaseZoom = useCallback((zoom: number) => {
        //zoomAmount.current = clamp(zoom, minZoom, maxZoom);
        //elementRef.current.style.transform = `scale(${zoomAmount.current})`;
        onZoom?.(zoom);
    },[onZoom]);

    /*useEffect(() => {

        //elementRef.current = document.getElementById(dest_id);
        if (!elementRef.current) {
            throw "An element with the ID " + dest_id + " doesn't exist";
        }
        if (disable_scrolling) {
            elementRef.current.addEventListener("wheel", onMouseWheel);
        }

        return () => {
            if (disable_scrolling) {
                elementRef.current.removeEventListener("wheel", onMouseWheel);
            }
        };
    }, [dest_id, disable_scrolling]);*/


    return <div className={styles.zoom_controls}>
        <button onClick={() => increaseZoom(0.25)}>+</button>
        <button onClick={() => increaseZoom(-0.25)}>-</button>
    </div>
}