import { useCallback, useContext, useEffect, useRef } from "react";
import { AreaNodeContext } from "./AreaNode";

import styles from "../../styles/NodeMover.module.css";
import grip_dots from "../../public/grip_dots.png"
import { ExpandableAreaContext } from "./ExpandableArea";


export interface NodeMoverProps {
    children: any,
    onUpdatePosition: (x: number, y: number) => void
}

export default function NodeMover({ children, onUpdatePosition }: NodeMoverProps) {
    const areaNodeContext = useContext(AreaNodeContext);
    const expandAreaContext = useContext(ExpandableAreaContext);

    const xMouseDiff = useRef(0);
    const yMouseDiff = useRef(0);
    const oldX = useRef(0);
    const oldY = useRef(0);

    const moving = useRef(false);

    if (!areaNodeContext) {
        throw "A NodeMover needs to be inside of an AreaNode component";
    }

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!moving.current) {
            return;
        }

        e.stopPropagation();
        let xDiff = e.pageX - oldX.current;
        let yDiff = e.pageY - oldY.current;

        let newX = oldX.current + (xDiff * (1 / expandAreaContext.zoom));
        let newY = oldY.current + (yDiff * (1 / expandAreaContext.zoom));

        areaNodeContext.node.current.style.left = `${(newX - xMouseDiff.current)}px`;
        areaNodeContext.node.current.style.top = `${(newY - yMouseDiff.current)}px`;
    }, [areaNodeContext, expandAreaContext.zoom]);

    let onMouseUp = null;
    onMouseUp = useCallback((e: MouseEvent) => {
        if (moving.current) {
            e.stopPropagation();
            moving.current = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            let xDiff = e.pageX - oldX.current;
            let yDiff = e.pageY - oldY.current;

            let newX = oldX.current + (xDiff * (1 / expandAreaContext.zoom));
            let newY = oldY.current + (yDiff * (1 / expandAreaContext.zoom));

            onUpdatePosition(areaNodeContext.x + (newX - oldX.current), areaNodeContext.y + (newY - oldY.current));
        }
    }, [areaNodeContext, onUpdatePosition, onMouseMove, expandAreaContext.zoom, onMouseMove]);

    const onMouseDown = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        moving.current = true;
        oldX.current = e.pageX;
        oldY.current = e.pageY;
        xMouseDiff.current = e.pageX - areaNodeContext.node.current.offsetLeft;
        yMouseDiff.current = e.pageY - areaNodeContext.node.current.offsetTop;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [areaNodeContext, onMouseMove, onMouseUp]);

    useEffect(() => {
        return () => {
            if (moving.current) {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            }
        }
    }, [onMouseMove, onMouseUp]);

    return <div className={styles.node_mover}>
        <div className={styles.draggable_area} onMouseDown={onMouseDown as any}>
            
        </div>
        <div className={styles.rest}>
            {children}
        </div>
    </div>
}