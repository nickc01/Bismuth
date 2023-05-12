import { useCallback, useContext, useEffect, useRef } from "react";
import { AreaNodeContext } from "./AreaNode";

import styles from "../../styles/NodeResizer.module.css";
import { BeginLockScrollbars, EndLockScrollbars, clamp } from "../global";
import { ExpandableAreaContext } from "./ExpandableArea";


export interface NodeResizerProps {
    children: any,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number,
    onUpdateSize: (x: number, y: number) => void
}

export default function NodeResizer({ children, onUpdateSize, minWidth = 180, minHeight = 200, maxWidth = 1000, maxHeight = 1000 }: NodeResizerProps) {
    const areaNodeContext = useContext(AreaNodeContext);
    const expandAreaContext = useContext(ExpandableAreaContext);

    const oldX = useRef(0);
    const oldY = useRef(0);
    const scrollLockID = useRef(null as string);

    const moving = useRef(false);

    if (!areaNodeContext) {
        throw "A NodeResizer needs to be inside of an AreaNode component";
    }

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!moving.current) {
            return;
        }
        e.stopPropagation();
        areaNodeContext.node.current.style.width = `${clamp(areaNodeContext.width + ((e.pageX - oldX.current) * (1 / expandAreaContext.zoom)), minWidth, maxWidth)}px`;
        areaNodeContext.node.current.style.height = `${clamp(areaNodeContext.height + ((e.pageY - oldY.current) * (1 / expandAreaContext.zoom)), minHeight, maxHeight)}px`;
    }, [areaNodeContext, expandAreaContext.zoom, maxHeight, maxWidth, minHeight, minWidth]);

    let onMouseUp = null;
    onMouseUp = useCallback((e: MouseEvent) => {
        if (moving.current) {
            e.stopPropagation();
            moving.current = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            onUpdateSize(clamp(areaNodeContext.width + ((e.pageX - oldX.current) * (1 / expandAreaContext.zoom)), minWidth, maxWidth), clamp(areaNodeContext.height + ((e.pageY - oldY.current) * (1 / expandAreaContext.zoom)), minHeight, maxHeight));
        }
    }, [areaNodeContext, expandAreaContext.zoom, maxHeight, maxWidth, minHeight, minWidth, onMouseMove, onUpdateSize]);

    const onMouseDown = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        moving.current = true;
        oldX.current = e.pageX;
        oldY.current = e.pageY;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }, [onMouseMove, onMouseUp]);

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (!moving.current) {
            return;
        }
        e.stopPropagation();
        areaNodeContext.node.current.style.width = `${clamp(areaNodeContext.width + ((e.targetTouches[0].pageX - oldX.current) * (1 / expandAreaContext.zoom)), minWidth, maxWidth)}px`;
        areaNodeContext.node.current.style.height = `${clamp(areaNodeContext.height + ((e.targetTouches[0].pageY - oldY.current) * (1 / expandAreaContext.zoom)), minHeight, maxHeight)}px`;
    }, [areaNodeContext, expandAreaContext.zoom, maxHeight, maxWidth, minHeight, minWidth]);

    let onTouchUp = null;
    onTouchUp = useCallback((e: TouchEvent) => {
        if (moving.current) {
            e.stopPropagation();
            moving.current = false;
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchUp);
            onUpdateSize(clamp(areaNodeContext.width + ((e.targetTouches[0].pageX - oldX.current) * (1 / expandAreaContext.zoom)), minWidth, maxWidth), clamp(areaNodeContext.height + ((e.targetTouches[0].pageY - oldY.current) * (1 / expandAreaContext.zoom)), minHeight, maxHeight));
            EndLockScrollbars(scrollLockID.current);
        }
    }, [areaNodeContext, expandAreaContext.zoom, maxHeight, maxWidth, minHeight, minWidth, onTouchMove, onUpdateSize]);

    const onTouchDown = useCallback((e: TouchEvent) => {
        e.stopPropagation();
        moving.current = true;
        oldX.current = e.targetTouches[0].pageX;
        oldY.current = e.targetTouches[0].pageY;
        window.addEventListener("touchmove", onTouchMove);
        window.addEventListener("touchend", onTouchUp);

        scrollLockID.current = BeginLockScrollbars();
    }, [onTouchMove, onTouchUp]);

    useEffect(() => {



        return () => {
            if (moving.current) {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
                window.removeEventListener("touchmove", onTouchMove);
                window.removeEventListener("touchend", onTouchUp);
            }
        }
    }, [onMouseMove, onMouseUp]);

    return <>
        <div className={styles.node_resizer} onMouseDown={onMouseDown as any} onTouchStart={onTouchDown as any} />
        <div className={styles.rest}>
            {children}
        </div>
    </>
}


/*<div className={styles.draggable_area} onMouseDown={onMouseDown as any} onMouseUp={onMouseUp as any}>
 
</div>
<div className={styles.rest}>
{children}
</div>*/