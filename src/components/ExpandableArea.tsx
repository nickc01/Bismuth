import { useCallback, useEffect, useMemo, useRef, useState, createContext, Dispatch, SetStateAction, MutableRefObject } from "react";
import styles from "../../styles/ExpandableArea.module.css";
import { NodeEntry } from "./AreaNode";
import ZoomControls from "./ZoomControls";
import { clamp } from "../global";


const BACKGROUND_PADDING = 1920 / 2;

export interface ContextNodes {
    [key: string]: NodeEntry
}

export interface ExpandableAreaContextValues {
    nodes: ContextNodes,
    zoom: number,
    setZoom: Dispatch<SetStateAction<number>>,
    zoomMin: number,
    zoomMax: number,
    ref: MutableRefObject<HTMLDivElement>,
    enableActions: (enabled: boolean) => void
}

export const ExpandableAreaContext = createContext(null as ExpandableAreaContextValues);


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
    children?: any,
    id?: string,
    zoomable?: boolean,
    zoomMin?: number,
    zoomMax?: number
}

export default function ExpandableArea({ children, id, zoomable = true, zoomMin = 0.25, zoomMax = 2 }: ExpandableAreaProps) {
    const movingBackground = useRef(false); //Is true when the background is being dragged
    const bgElement = useRef(null as HTMLDivElement); //A reference to the background element that contains all child elements
    const inputElement = useRef(null as HTMLElement); //A reference to the element that receives input events
    const zoomElement = useRef(null as HTMLElement); //A reference to the element within the background that zooms in and out
    const bounds = useRef(null as Rect); //Stores the bounds of all the child elements in the background element
    const [zoom, setZoom] = useState(1); //The zoom multiplier
    const actionsEnabled = useRef(true); //If set to true, then background movement will also be enabled

    let contextValue = null as ExpandableAreaContextValues;
    contextValue = useMemo(() => {
        return {
            nodes: {},
            zoom: zoom,
            setZoom: setZoom,
            zoomMax: zoomMax,
            zoomMin: zoomMin,
            ref: bgElement,
            enableActions: (enabled: boolean) => {
                actionsEnabled.current = enabled;

                if (zoomElement.current) {
                    if (!enabled) {
                        zoomElement.current.classList.add(styles.disable_all);
                    }
                    else {
                        zoomElement.current.classList.remove(styles.disable_all);
                    }
                }
            }
        };
    }, [zoom, zoomMax, zoomMin]);

    contextValue.zoom = zoom;
    contextValue.zoomMax = zoomMax;
    contextValue.zoomMin = zoomMin;

    const onBackgroundClick = useCallback((e: MouseEvent) => {
        if (e.target === inputElement.current && actionsEnabled.current) {
            movingBackground.current = true;
            zoomElement.current.classList.add(styles.disable_all);
        }
    }, []);

    const onBackgroundRelease = useCallback((e: MouseEvent) => {
        if (!actionsEnabled.current) {
            return;
        }
        movingBackground.current = false;
        zoomElement.current.classList.remove(styles.disable_all);
    }, []);

    const mouseLeaveWindow = useCallback((e: MouseEvent) => {
        if (!actionsEnabled.current) {
            return;
        }
        if (movingBackground.current) {
            movingBackground.current = false;
            zoomElement.current.classList.remove(styles.disable_all);
        }
    }, []);

    const onMouseWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        if (!actionsEnabled.current) {
            return;
        }
        setZoom(prev => {
            return clamp(prev - (e.deltaY / 400), zoomMin, zoomMax);
        });

    }, [zoomMin, zoomMax]);

    const onBackgroundDrag = useCallback((e: MouseEvent) => {
        if (!actionsEnabled.current) {
            return;
        }
        if (movingBackground.current) {
            document.documentElement.scrollBy(-e.movementX, -e.movementY);
        }
    },[]);

    useEffect(() => {

        let prevBounds = bounds.current;

        bounds.current = calculateBounds(contextValue.nodes);

        bgElement.current.style.width = `${bounds.current.width + (BACKGROUND_PADDING * 2)}px`;
        bgElement.current.style.height = `${bounds.current.height + (BACKGROUND_PADDING * 2)}px`;

        const keys = Object.keys(contextValue.nodes);

        for (let i = 0; i < keys.length; i++) {
            const element = contextValue.nodes[keys[i]];
            element.node.current.style.left = `${element.x - bounds.current.x + (BACKGROUND_PADDING)}px`;
            element.node.current.style.top = `${element.y - bounds.current.y + (BACKGROUND_PADDING)}px`;
        }

        let scrollUpdateX = 0;
        let scrollUpdateY = 0;

        if (prevBounds) {
            scrollUpdateX = (prevBounds.x - bounds.current.x) * (zoom);
            scrollUpdateY = (prevBounds.y - bounds.current.y) * (zoom);


            let widthUpdate = (bounds.current.width - prevBounds.width) * (1 - zoom) / 2;
            let heightUpdate = (bounds.current.height - prevBounds.height) * (1 - zoom) / 2;

            scrollUpdateX += widthUpdate;
            scrollUpdateY += heightUpdate;
        }

        if (contextValue.zoom > 1) {
        }

        if (scrollUpdateX !== 0 || scrollUpdateY !== 0) {
            document.documentElement.scrollBy(scrollUpdateX, scrollUpdateY);
        }
        zoomElement.current.style.transform = `scale(${contextValue.zoom})`;

    }, [zoomable, zoom, children, contextValue.nodes, contextValue.zoom]);

    useEffect(() => {
        if (zoomable) {
            inputElement.current.addEventListener("wheel", onMouseWheel);
        }
        return () => {
            if (zoomable && inputElement.current) {
                inputElement.current.removeEventListener("wheel", onMouseWheel);
            }
        };
    }, [zoomable, onMouseWheel]);

    useEffect(() => {
        inputElement.current.addEventListener("mousedown", onBackgroundClick);
        inputElement.current.addEventListener("mousemove", onBackgroundDrag);
        inputElement.current.addEventListener("mouseup", onBackgroundRelease);

        window.addEventListener("mouseout", mouseLeaveWindow);

        contextValue.enableActions(actionsEnabled.current);

        return () => {
            window.removeEventListener("mouseout", mouseLeaveWindow);
            if (inputElement.current) {
                inputElement.current.removeEventListener("mousedown", onBackgroundClick);
                inputElement.current.removeEventListener("mousemove", onBackgroundDrag);
                inputElement.current.removeEventListener("mouseup", onBackgroundRelease);
            }
        }
    }, [onBackgroundClick, onBackgroundDrag, onBackgroundRelease, mouseLeaveWindow, contextValue]);

    useEffect(() => {
        let centerScrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        let centerScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        document.documentElement.scrollTo(centerScrollX / 2, centerScrollY / 2);
    },[]);

    return <>
        <div id={id + "_input_grabber"} ref={inputElement as any} className={styles.input_grabber} />
        <div id={id} ref={bgElement as any} className={styles.contents}>
            <ExpandableAreaContext.Provider value={contextValue}>
                <div ref={zoomElement as any} className={styles.zoomable_container}>
                    {children}
                </div>
                </ExpandableAreaContext.Provider>
        </div>
        {zoomable && <ZoomControls onZoom={diff => setZoom(prev => clamp(prev + diff, zoomMin, zoomMax))} />}
    </>
}