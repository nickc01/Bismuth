import { useCallback, useEffect, useMemo, useRef, useState, createContext } from "react";
import { TaskInfo } from "./Task";
import styles from "../../styles/ExpandableArea.module.css";
import { NodeEntry } from "./AreaNode";
import ZoomControls from "./ZoomControls";
import { clamp } from "../global";


const BACKGROUND_PADDING = 750;

export interface ContextNodes {
    [key: string]: NodeEntry
}

export interface ExpandableAreaContextValues {
    nodes: ContextNodes
}

export const ExpandableAreaContext = createContext(null as ExpandableAreaContextValues);

/*type Rect = {
    x: number,
    y: number,
    width: number,
    height: number
}*/


export interface Rect {
    x: number,
    y: number,
    width: number,
    height: number,
}

function calculateBounds(nodes: any): Rect {
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;

    const keys = Object.keys(nodes);

    for (let i = 0; i < keys.length; i++) {
        const element = nodes[keys[i]] as Rect;
        if (element.x < minX) {
            minX = element.x;
        }
        if (element.y < minY) {
            minY = element.y;
        }
        if (element.x + element.width > maxX) {
            maxX = element.x + element.width;
        }
        if (element.y + element.height > maxY) {
            maxY = element.y + element.height;
        }
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

export interface ExpandableAreaProps {
    children?: any[],
    id?: string,
    zoomable?: boolean,
    zoomMin?: number,
    zoomMax?: number
    //zoomAmount?: number,
}

export default function ExpandableArea({ children, id, zoomable = true, zoomMin = 0.25, zoomMax = 2 }: ExpandableAreaProps) {
    const movingBackground = useRef(false);
    const bgElement = useRef(null as HTMLElement);
    const inputElement = useRef(null as HTMLElement);
    const zoomElement = useRef(null as HTMLElement);
    const bounds = useRef(null as Rect);
    const [zoom, setZoom] = useState(1);

    console.log("EXPANDABLE AREA RENDER");



    //const bounds = useMemo(() => calculateBounds(children), [children]);

    /*const setZoom = useCallback(zoom => {
        zoom = clamp(zoom, zoomMin, zoomMax);

        setZoomRaw(zoom);
    },[zoomable, zoomMin, zoomMax]);*/

    const onBackgroundClick = useCallback((e: MouseEvent) => {
        if (e.target === inputElement.current) {
            movingBackground.current = true;
        }
    }, []);

    const onBackgroundDrag = useCallback((e: MouseEvent) => {
        if (movingBackground.current) {
            document.documentElement.scrollBy(-e.movementX, -e.movementY);
        }
    }, []);

    const onBackgroundRelease = useCallback((e: MouseEvent) => {
        movingBackground.current = false;
    }, []);

    const mouseLeaveWindow = useCallback((e: MouseEvent) => {
        if (movingBackground.current) {
            movingBackground.current = false;
        }
    }, []);

    const onMouseWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        setZoom(prev => {
            return clamp(prev - (e.deltaY / 400), zoomMin, zoomMax);
        });

    }, []);

    let contextValue = null as ExpandableAreaContextValues;
    contextValue = useMemo(() => {
        return {
            nodes: {}
        };
    }, []);

    useEffect(() => {

        console.log("EXPANDABLE AREA EFFECT");

        /*if (bgElement.current === null) {
            bgElement.current = document.getElementsByClassName(styles.background)[0] as HTMLElement;
        }*/
        //console.log(bounds);
        //console.log(bgElement.current.getClientRects());

        let prevBounds = bounds.current;

        bounds.current = calculateBounds(contextValue.nodes);



        //console.log("Bounds = ");
        //console.log(bounds);

        //TODO
        //bgElement.current.style.width = `max(${bounds.width}px, 100%)`;
        //bgElement.current.style.height = `max(${bounds.height}px, 100vh)`;

        /*if (zoomable) {
            bgElement.current.style.transform = `scale(${zoom})`;
        }
        else {
            bgElement.current.style.transform = "";
        }*/

        //const percentage = 100// * (1 / zoomAmount);

        bgElement.current.style.width = `${bounds.current.width + (BACKGROUND_PADDING * 2)}px`;
        bgElement.current.style.height = `${bounds.current.height + (BACKGROUND_PADDING * 2)}px`;

        //bgElement.current.style.width = `max(${bounds.current.width + (BACKGROUND_PADDING * 2)}px,${percentage}%)`;
        //bgElement.current.style.height = `max(${bounds.current.height + (BACKGROUND_PADDING * 2)}px,${percentage}vh)`;

        //bgElement.current.style.width = "100vw";
        //bgElement.current.style.height = "100vh";

        const keys = Object.keys(contextValue.nodes);

        for (let i = 0; i < keys.length; i++) {
            const element = contextValue.nodes[keys[i]];
            element.node.current.style.left = `${element.x - bounds.current.x + (BACKGROUND_PADDING)}px`;
            element.node.current.style.top = `${element.y - bounds.current.y + (BACKGROUND_PADDING)}px`;
        }

        if (prevBounds) {
            document.documentElement.scrollBy(prevBounds.x - bounds.current.x, prevBounds.y - bounds.current.y);
        }


    }, [zoomable, zoom, children]);

    useEffect(() => {
        if (zoomable) {
            inputElement.current.addEventListener("wheel", onMouseWheel);
        }

        return () => {
            if (zoomable) {
                inputElement.current.removeEventListener("wheel", onMouseWheel);
            }
        };
    }, [zoomable]);

    useEffect(() => {
        inputElement.current.addEventListener("mousedown", onBackgroundClick);
        inputElement.current.addEventListener("mousemove", onBackgroundDrag);
        inputElement.current.addEventListener("mouseup", onBackgroundRelease);

        window.addEventListener("mouseout", mouseLeaveWindow);

        let centerScrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        let centerScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        document.documentElement.scrollTo(centerScrollX / 2, centerScrollY / 2);

        return () => {
            window.removeEventListener("mouseout", mouseLeaveWindow);
        }
    }, []);

    return <>
        <div id={id + "_input_grabber"} ref={inputElement as any} className={styles.input_grabber} />
        <div id={id} ref={bgElement as any} className={styles.contents}>
            <ExpandableAreaContext.Provider value={contextValue}>
                <div ref={zoomElement as any} className={styles.zoomable_container} style={{ transform: `scale(${zoom})` }}>
                    {children}
                </div>
                </ExpandableAreaContext.Provider>
        </div>
        {zoomable && <ZoomControls onZoom={diff => setZoom(prev => clamp(prev + diff, zoomMin, zoomMax))} />}
    </>
}