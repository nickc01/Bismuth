import { useCallback, useEffect, useMemo, useRef, useState, createContext, Dispatch, SetStateAction, MutableRefObject } from "react";
import { TaskInfo } from "./Task";
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
    children?: any,
    id?: string,
    zoomable?: boolean,
    zoomMin?: number,
    zoomMax?: number
    //zoomAmount?: number,
}

export default function ExpandableArea({ children, id, zoomable = true, zoomMin = 0.25, zoomMax = 2 }: ExpandableAreaProps) {
    const movingBackground = useRef(false);
    const bgElement = useRef(null as HTMLDivElement);
    const inputElement = useRef(null as HTMLElement);
    const zoomElement = useRef(null as HTMLElement);
    const bounds = useRef(null as Rect);
    const [zoom, setZoom] = useState(1);
    const actionsEnabled = useRef(true);

    const ignoreNextScroll = useRef(false);
    //console.log("EXPANDABLE AREA RENDER");



    //const bounds = useMemo(() => calculateBounds(children), [children]);

    /*const setZoom = useCallback(zoom => {
        zoom = clamp(zoom, zoomMin, zoomMax);

        setZoomRaw(zoom);
    },[zoomable, zoomMin, zoomMax]);*/

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

    const updateTransformOrigin = useCallback(() => {
        //let prevScrollPercentageX = (document.documentElement.scrollLeft + (document.documentElement.clientWidth / 2)) / document.documentElement.scrollWidth;
        //let prevScrollPercentageY = (document.documentElement.scrollTop + (document.documentElement.clientHeight / 2)) / document.documentElement.scrollHeight;
        //console.log("PERCENTAGE X = " + prevScrollPercentageX);
        //console.log("PERCENTAGE Y = " + prevScrollPercentageY);

        /*for (var i = 0; i < 10; i++) {
            console.log("Scroll Update = " + (i + 1));
            zoomElement.current.style.transformOrigin = `${prevScrollPercentageX * 100}% ${prevScrollPercentageY * 100}%`;

            let scrollPercentageX = (document.documentElement.scrollLeft + (document.documentElement.clientWidth / 2)) / document.documentElement.scrollWidth;
            let scrollPercentageY = (document.documentElement.scrollTop + (document.documentElement.clientHeight / 2)) / document.documentElement.scrollHeight;

            if (scrollPercentageX === prevScrollPercentageX && scrollPercentageY === prevScrollPercentageY) {
                break;
            }
        }*/
        //ignoreNextScroll.current = true;
        //console.log("ORIGIN UPDATE");
        //console.trace();
    },[]);

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
        //console.log("Zooming!!!2");
        e.preventDefault();

        if (!actionsEnabled.current) {
            return;
        }

        //console.log("Zooming!!!");

        setZoom(prev => {
            return clamp(prev - (e.deltaY / 400), zoomMin, zoomMax);
        });

    }, [zoomMin, zoomMax]);

    const onScroll = useCallback(() => {

        //console.log("C SCROLL X = " + document.documentElement.scrollLeft);
        //console.log("C SCROLL Y = " + document.documentElement.scrollTop);
        if (ignoreNextScroll.current) {
            ignoreNextScroll.current = false;
        }
        else {
            updateTransformOrigin();
        }
    }, [updateTransformOrigin]);

    const onBackgroundDrag = useCallback((e: MouseEvent) => {
        if (!actionsEnabled.current) {
            return;
        }
        if (movingBackground.current) {
            //console.log("SCROLL C");
            //document.documentElement.scrollBy(-e.movementX * (1 / contextValue.zoom), -e.movementY * 1 / contextValue.zoom);
            document.documentElement.scrollBy(-e.movementX, -e.movementY);
        }
    },[]);

    useEffect(() => {
        //console.log("EXPANDABLE AREA EFFECT");

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

        let scrollUpdateX = 0;
        let scrollUpdateY = 0;

        if (prevBounds) {
            //console.log("Scrolling!!!");
            //let scale = 2 * zoom;
            //console.log("ScrollX Scale = " + scale);
            //console.log("Scroll Amount = " + ((prevBounds.x * scale) - (bounds.current.x * scale)));
            //console.log("Unscaled Scroll Amount = " + (prevBounds.x - bounds.current.x));
            //document.documentElement.scrollBy((prevBounds.x * scale) - (bounds.current.x * scale), (prevBounds.y * scale) - (bounds.current.y * scale));
            //document.documentElement.scrollBy(prevBounds.x - bounds.current.x, prevBounds.y - bounds.current.y);

            scrollUpdateX = (prevBounds.x - bounds.current.x) * (zoom);
            scrollUpdateY = (prevBounds.y - bounds.current.y) * (zoom);

            /*if (zoom < 0.9 && zoom > 0.6) {
                console.log("ZOOM A");
                scrollUpdateX *= 1.0 / 1.1529857167441064102564102564103;
                scrollUpdateY *= 1.0 / 1.1529857167441064102564102564103;
            }
            else if (zoom < 0.6 && zoom > 0.35) {
                console.log("ZOOM B");
                scrollUpdateX *= 1.0 / 1.3435374149659866666666666666667;
                scrollUpdateY *= 1.0 / 1.3435374149659866666666666666667;
            }
            else if (zoom < 0.3 && zoom > 0) {
                console.log("ZOOM C");
                scrollUpdateX *= 1.0 / 1.5988538681948424068767908309456;
                scrollUpdateY *= 1.0 / 1.5988538681948424068767908309456;
            }*/


            let widthUpdate = (bounds.current.width - prevBounds.width) * (1 - zoom) / 2;
            let heightUpdate = (bounds.current.height - prevBounds.height) * (1 - zoom) / 2;

            /*if (zoom < 0.9 && zoom > 0.6) {
                console.log("ZOOM A");
                //scrollUpdateX *= 1.0 / 1.1529857167441064102564102564103;
                //scrollUpdateY *= 1.0 / 1.1529857167441064102564102564103;
            }
            else if (zoom < 0.6 && zoom > 0.35) {
                console.log("ZOOM B");
                //scrollUpdateX *= 1.0 / 1.3435374149659866666666666666667;
                //scrollUpdateY *= 1.0 / 1.3435374149659866666666666666667;
            }
            else if (zoom < 0.3 && zoom > 0) {
                console.log("ZOOM C");
                //scrollUpdateX *= 1.0 / 1.5988538681948424068767908309456;
                //scrollUpdateY *= 1.0 / 1.5988538681948424068767908309456;
            }*/

            scrollUpdateX += widthUpdate;
            scrollUpdateY += heightUpdate;



            //scale = (zoom - 1);

            //console.log("ScrollWidth Scale = " + scale);
            // console.log("Scroll Width Amount = " + ((prevBounds.width * scale) - (bounds.current.width * scale)));
            //console.log("Unscaled Scroll Width Amount = " + (prevBounds.width - bounds.current.width));

            //document.documentElement.scrollBy((prevBounds.width * scale) - (bounds.current.width * scale), (prevBounds.height * scale) - (bounds.current.height * scale));
        }

        if (contextValue.zoom > 1) {
            //let scrollPercentageX = ((document.documentElement.scrollLeft + (document.documentElement.clientWidth / 2)) / document.documentElement.scrollWidth) - 0.5;
            //let scrollPercentageY = ((document.documentElement.scrollTop + (document.documentElement.clientHeight / 2)) / document.documentElement.scrollHeight) - 0.5;

            //let scale = -1 / (contextValue.zoom + 6);
            //let scale = 0;

            //document.documentElement.scrollBy((prevBounds.x - bounds.current.x) * scale, (prevBounds.y - bounds.current.y) * scale);
            //document.documentElement.scrollBy((prevBounds.width - bounds.current.width) * scale, (prevBounds.height - bounds.current.height) * scale);

            //scrollUpdateX += (prevBounds.width - bounds.current.width) * scale;
            //scrollUpdateY += (prevBounds.height - bounds.current.height) * scale;
        }

        if (scrollUpdateX !== 0 || scrollUpdateY !== 0) {
            //console.log("SCROLL B = " + scrollUpdateX + ", " + scrollUpdateY);
            //console.log("OLD SCROLL X = " + document.documentElement.scrollLeft);
            //console.log("OLD SCROLL Y = " + document.documentElement.scrollTop);
            document.documentElement.scrollBy(scrollUpdateX, scrollUpdateY);

            //console.log("NEW SCROLL X = " + document.documentElement.scrollLeft);
            //console.log("NEW SCROLL Y = " + document.documentElement.scrollTop);
        }

        /*let scrollPercentageX = (document.documentElement.scrollLeft + (document.documentElement.clientWidth / 2)) / document.documentElement.scrollWidth;
        let scrollPercentageY = (document.documentElement.scrollTop + (document.documentElement.clientHeight / 2)) / document.documentElement.scrollHeight;

        console.log("Scroll Percentage X = " + scrollPercentageX);
        console.log("Scroll Percentage Y = " + scrollPercentageY);*/

        //zoomElement.current.style.transformOrigin = `${scrollPercentageX * 100}% ${scrollPercentageY * 100}%`;

        //let scrollPercentageX = (document.documentElement.scrollLeft + (document.documentElement.clientWidth / 2)) / document.documentElement.scrollWidth;
        //let scrollPercentageY = (document.documentElement.scrollTop + (document.documentElement.clientHeight / 2)) / document.documentElement.scrollHeight;

        //console.log("Scroll Percentage X = " + scrollPercentageX);
        //console.log("Scroll Percentage Y = " + scrollPercentageY);

        //zoomElement.current.style.transformOrigin = `${scrollPercentageX * 100}% ${scrollPercentageY * 100}%`;

        zoomElement.current.style.transform = `scale(${contextValue.zoom})`;

        updateTransformOrigin();

        return () => {
            
        }

    }, [zoomable, zoom, children, contextValue.nodes, contextValue.zoom, updateTransformOrigin]);

    useEffect(() => {
        //console.log("1");
        if (zoomable) {
            //console.log("2");
            inputElement.current.addEventListener("wheel", onMouseWheel);
        }
        //console.log("3");
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

        window.addEventListener("scroll", onScroll);

        window.addEventListener("mouseout", mouseLeaveWindow);

        let centerScrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        let centerScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        //console.log("SCROLL A = " + (centerScrollX / 2) + ", " + (centerScrollY / 2));
        document.documentElement.scrollTo(centerScrollX / 2, centerScrollY / 2);

        contextValue.enableActions(actionsEnabled.current);

        /*const updateLoop = () => {
            let scrollPercentageX = (document.documentElement.scrollLeft + (document.documentElement.clientWidth / 2)) / document.documentElement.scrollWidth;
            let scrollPercentageY = (document.documentElement.scrollTop + (document.documentElement.clientHeight / 2)) / document.documentElement.scrollHeight;

            zoomElement.current.style.transformOrigin = `${scrollPercentageX * 100}% ${scrollPercentageY * 100}%`;

            requestAnimationFrame(updateLoop);
        };

        requestAnimationFrame(updateLoop);*/

        return () => {
            window.removeEventListener("mouseout", mouseLeaveWindow);
            window.removeEventListener("scroll", onScroll);
            if (inputElement.current) {
                inputElement.current.removeEventListener("mousedown", onBackgroundClick);
                inputElement.current.removeEventListener("mousemove", onBackgroundDrag);
                inputElement.current.removeEventListener("mouseup", onBackgroundRelease);
            }
        }
    }, [onBackgroundClick, onBackgroundDrag, onBackgroundRelease, onScroll, mouseLeaveWindow, contextValue]);

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