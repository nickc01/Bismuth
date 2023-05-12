import { useCallback, useContext, useEffect, useRef } from "react";
import { AreaNodeContext } from "./AreaNode";

import styles from "../../styles/NodeResizer.module.css";
import { clamp } from "../global";
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

    //const xMouseDiff = useRef(0);
    //const yMouseDiff = useRef(0);
    const oldX = useRef(0);
    const oldY = useRef(0);

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
        //xMouseDiff.current = e.pageX - areaNodeContext.node.current.offsetLeft;
        //yMouseDiff.current = e.pageY - areaNodeContext.node.current.offsetTop;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }, [onMouseMove, onMouseUp]);

    useEffect(() => {



        return () => {
            if (moving.current) {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
            }
        }
    }, [onMouseMove, onMouseUp]);

    return <>
        <div className={styles.node_resizer} onMouseDown={onMouseDown as any} />
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