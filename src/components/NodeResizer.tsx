import { useCallback, useContext, useEffect, useRef } from "react";
import { AreaNodeContext } from "./AreaNode";
import styles from "../../styles/NodeResizer.module.css";
import { BeginLockScrollbars, EndLockScrollbars, clamp } from "../global";
import { ExpandableAreaContext } from "./ExpandableArea";

// Define the props for the NodeResizer component
export interface NodeResizerProps {
    children: any,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number,
    onUpdateSize: (x: number, y: number) => void
}

// Define the NodeResizer component
export default function NodeResizer({ children, onUpdateSize, minWidth = 180, minHeight = 200, maxWidth = 1000, maxHeight = 1000 }: NodeResizerProps) {
    // Get the context from the AreaNode component
    const areaNodeContext = useContext(AreaNodeContext);
    const expandAreaContext = useContext(ExpandableAreaContext);

    // Create refs for storing previous positions and touch coordinates
    const oldX = useRef(0);
    const oldY = useRef(0);
    const lastTouchX = useRef(0);
    const lastTouchY = useRef(0);
    const scrollLockID = useRef(null as string);

    // Create a ref for tracking the movement state
    const moving = useRef(false);

    // Throw an error if the NodeResizer component is not inside an AreaNode component
    if (!areaNodeContext) {
        throw "A NodeResizer needs to be inside of an AreaNode component";
    }

    // Define the mouse move event handler
    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!moving.current) {
            return;
        }
        e.stopPropagation();
        // Adjust the width and height of the area node based on mouse movement
        areaNodeContext.node.current.style.width = `${clamp(areaNodeContext.width + ((e.pageX - oldX.current) * (1 / expandAreaContext.zoom)), minWidth, maxWidth)}px`;
        areaNodeContext.node.current.style.height = `${clamp(areaNodeContext.height + ((e.pageY - oldY.current) * (1 / expandAreaContext.zoom)), minHeight, maxHeight)}px`;
    }, [areaNodeContext, expandAreaContext.zoom, maxHeight, maxWidth, minHeight, minWidth]);

    let onMouseUp = null;

    // Define the mouse up event handler
    onMouseUp = useCallback((e: MouseEvent) => {
        if (moving.current) {
            e.stopPropagation();
            moving.current = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            // Call the onUpdateSize callback with the updated width and height
            onUpdateSize(
                clamp(areaNodeContext.width + ((e.pageX - oldX.current) * (1 / expandAreaContext.zoom)), minWidth, maxWidth),
                clamp(areaNodeContext.height + ((e.pageY - oldY.current) * (1 / expandAreaContext.zoom)), minHeight, maxHeight)
            );
        }
    }, [areaNodeContext, expandAreaContext.zoom, maxHeight, maxWidth, minHeight, minWidth, onMouseMove, onUpdateSize]);

    // Define the mouse down event handler
    const onMouseDown = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        moving.current = true;
        oldX.current = e.pageX;
        oldY.current = e.pageY;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }, [onMouseMove, onMouseUp]);

    // Define the touch move event handler
    const onTouchMove = useCallback((e: TouchEvent) => {
        if (!moving.current) {
            return;
        }
        e.preventDefault();

        lastTouchX.current = e.targetTouches[0].pageX;
        lastTouchY.current = e.targetTouches[0].pageY;

        // Adjust the width and height of the area node based on touch movement
        areaNodeContext.node.current.style.width = `${clamp(areaNodeContext.width + ((e.targetTouches[0].pageX - oldX.current) * (1 / expandAreaContext.zoom)), minWidth, maxWidth)}px`;
        areaNodeContext.node.current.style.height = `${clamp(areaNodeContext.height + ((e.targetTouches[0].pageY - oldY.current) * (1 / expandAreaContext.zoom)), minHeight, maxHeight)}px`;
    }, [areaNodeContext, expandAreaContext.zoom, maxHeight, maxWidth, minHeight, minWidth]);

    let onTouchUp = null;

    // Define the touch up event handler
    onTouchUp = useCallback((e: TouchEvent) => {
        if (moving.current) {
            e.preventDefault();
            moving.current = false;
            EndLockScrollbars(scrollLockID.current);
            // Call the onUpdateSize callback with the updated width and height
            onUpdateSize(
                clamp(areaNodeContext.width + ((lastTouchX.current - oldX.current) * (1 / expandAreaContext.zoom)), minWidth, maxWidth),
                clamp(areaNodeContext.height + ((lastTouchY.current - oldY.current) * (1 / expandAreaContext.zoom)), minHeight, maxHeight)
            );
        }
    }, [areaNodeContext, expandAreaContext.zoom, maxHeight, maxWidth, minHeight, minWidth, onTouchMove, onUpdateSize]);

    // Define the touch down event handler
    const onTouchDown = useCallback((e: TouchEvent) => {
        moving.current = true;
        oldX.current = e.targetTouches[0].pageX;
        oldY.current = e.targetTouches[0].pageY;
        lastTouchX.current = e.targetTouches[0].pageX;
        lastTouchY.current = e.targetTouches[0].pageY;
        e.preventDefault();

        scrollLockID.current = BeginLockScrollbars();
    }, [onTouchMove, onTouchUp]);

    useEffect(() => {
        // Cleanup event listeners and scroll locks when component unmounts
        return () => {
            if (moving.current) {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
                EndLockScrollbars(scrollLockID.current);
            }
        };
    }, [onMouseMove, onMouseUp]);

    return (
        <>
            <div className={styles.node_resizer} onMouseDown={onMouseDown as any} onTouchStart={onTouchDown as any} onTouchMove={onTouchMove as any} onTouchEnd={onTouchUp} onTouchCancel={onTouchUp} />
            <div className={styles.rest}>
                {children}
            </div>
        </>
    );
}