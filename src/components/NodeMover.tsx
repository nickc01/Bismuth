import { useCallback, useContext, useEffect, useRef } from "react";
import { AreaNodeContext } from "./AreaNode";

import styles from "../../styles/NodeMover.module.css";


export interface NodeMoverProps {
    children: any,
    onUpdatePosition: (x: number, y: number) => void
}

export default function NodeMover({ children, onUpdatePosition }: NodeMoverProps) {
    const areaNodeContext = useContext(AreaNodeContext);

    const xMouseDiff = useRef(0);
    const yMouseDiff = useRef(0);
    const oldX = useRef(0);
    const oldY = useRef(0);

    const moving = useRef(false);

    if (!areaNodeContext) {
        throw "A NodeMover needs to be inside of an AreaNode component";
    }


    const onMouseDown = useCallback((e: MouseEvent) => {
        moving.current = true;
        oldX.current = e.pageX;
        oldY.current = e.pageY;
        xMouseDiff.current = e.pageX - areaNodeContext.node.current.offsetLeft;
        yMouseDiff.current = e.pageY - areaNodeContext.node.current.offsetTop;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [areaNodeContext]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!moving.current) {
            return;
        }
        areaNodeContext.node.current.style.left = `${e.pageX - xMouseDiff.current}px`;
        areaNodeContext.node.current.style.top = `${e.pageY - yMouseDiff.current}px`;
    }, [areaNodeContext]);

    const onMouseUp = useCallback((e: MouseEvent) => {
        if (moving.current) {
            moving.current = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            onUpdatePosition(areaNodeContext.x + (e.pageX - oldX.current), areaNodeContext.y + (e.pageY - oldY.current));
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

    return <div className={styles.node_mover}>
        <div className={styles.draggable_area} onMouseDown={onMouseDown as any}>
            
        </div>
        <div className={styles.rest}>
            {children}
        </div>
    </div>
}