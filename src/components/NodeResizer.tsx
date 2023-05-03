import { useCallback, useContext, useEffect, useRef } from "react";
import { AreaNodeContext } from "./AreaNode";

import styles from "../../styles/NodeResizer.module.css";


export interface NodeResizerProps {
    children: any,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number,
    onUpdateSize: (x: number, y: number) => void
}

const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min),max);
};

export default function NodeResizer({ children, onUpdateSize, minWidth = 150, minHeight = 150, maxWidth = 1000, maxHeight = 1000 }: NodeResizerProps) {
    const areaNodeContext = useContext(AreaNodeContext);

    //const xMouseDiff = useRef(0);
    //const yMouseDiff = useRef(0);
    const oldX = useRef(0);
    const oldY = useRef(0);

    const moving = useRef(false);

    if (!areaNodeContext) {
        throw "A NodeResizer needs to be inside of an AreaNode component";
    }


    const onMouseDown = useCallback((e: MouseEvent) => {
        moving.current = true;
        oldX.current = e.pageX;
        oldY.current = e.pageY;
        //xMouseDiff.current = e.pageX - areaNodeContext.node.current.offsetLeft;
        //yMouseDiff.current = e.pageY - areaNodeContext.node.current.offsetTop;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [areaNodeContext]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!moving.current) {
            return;
        }
        areaNodeContext.node.current.style.width = `${clamp(areaNodeContext.width + e.pageX - oldX.current, minWidth, maxWidth)}px`;
        areaNodeContext.node.current.style.height = `${clamp(areaNodeContext.height + e.pageY - oldY.current, minHeight, maxHeight)}px`;
    }, [areaNodeContext]);

    const onMouseUp = useCallback((e: MouseEvent) => {
        if (moving.current) {
            moving.current = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            onUpdateSize(clamp(areaNodeContext.width + e.pageX - oldX.current, minWidth, maxWidth), clamp(areaNodeContext.height + e.pageY - oldY.current, minHeight, maxHeight));
        }
    }, [areaNodeContext]);

    useEffect(() => {
        

        return () => {
            if (moving.current) {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }
        }
    },[]);

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