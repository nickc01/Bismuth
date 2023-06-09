import { useCallback, useContext, useEffect, useRef } from "react";
import { AreaNodeContext } from "./AreaNode";
import styles from "../../styles/NodeMover.module.css";
import { ExpandableAreaContext } from "./ExpandableArea";
import { BeginLockScrollbars, EndLockScrollbars } from "../global";

// Define the props for the NodeMover component
export interface NodeMoverProps {
    children: any,
    onUpdatePosition: (x: number, y: number) => void
}

// Define the NodeMover component
export default function NodeMover({ children, onUpdatePosition }: NodeMoverProps) {
    // Get the areaNodeContext and expandAreaContext from the respective contexts
    const areaNodeContext = useContext(AreaNodeContext);
    const expandAreaContext = useContext(ExpandableAreaContext);

    // Create refs to store values across renders
    const xMouseDiff = useRef(0);
    const yMouseDiff = useRef(0);
    const oldX = useRef(0);
    const oldY = useRef(0);
    const scrollLockID = useRef(null as string);
    const lastTouchX = useRef(0);
    const lastTouchY = useRef(0);

    // Create a ref to track if the node is currently being moved
    const moving = useRef(false);

    // Throw an error if the NodeMover is not inside an AreaNode component
    if (!areaNodeContext) {
        throw "A NodeMover needs to be inside of an AreaNode component";
    }

    // Callback function to handle mouse movement
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

    // Callback function to handle mouse up event
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

    // Callback function to handle mouse down event
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

    // Callback function to handle touch movement
    const onTouchMove = useCallback((e: TouchEvent) => {
        if (!moving.current) {
            return;
        }

        e.preventDefault();
        let xDiff = e.targetTouches[0].pageX - oldX.current;
        let yDiff = e.targetTouches[0].pageY - oldY.current;

        let newX = oldX.current + (xDiff * (1 / expandAreaContext.zoom));
        let newY = oldY.current + (yDiff * (1 / expandAreaContext.zoom));

        lastTouchX.current = e.targetTouches[0].pageX;
        lastTouchY.current = e.targetTouches[0].pageY;

        areaNodeContext.node.current.style.left = `${(newX - xMouseDiff.current)}px`;
        areaNodeContext.node.current.style.top = `${(newY - yMouseDiff.current)}px`;
    }, [areaNodeContext, expandAreaContext.zoom]);

    // Callback function to handle touch end event
    let onTouchUp = null;
    onTouchUp = useCallback((e: TouchEvent) => {
        if (moving.current) {
            e.preventDefault();
            moving.current = false;
            EndLockScrollbars(scrollLockID.current);

            let xDiff = lastTouchX.current - oldX.current;
            let yDiff = lastTouchY.current - oldY.current;

            let newX = oldX.current + (xDiff * (1 / expandAreaContext.zoom));
            let newY = oldY.current + (yDiff * (1 / expandAreaContext.zoom));

            onUpdatePosition(areaNodeContext.x + (newX - oldX.current), areaNodeContext.y + (newY - oldY.current));
        }
    }, [areaNodeContext, onUpdatePosition, onTouchMove, expandAreaContext.zoom, onTouchMove]);

    // Callback function to handle touch start event
    const onTouchDown = useCallback((e: TouchEvent) => {
        moving.current = true;
        oldX.current = e.targetTouches[0].pageX;
        oldY.current = e.targetTouches[0].pageY;
        xMouseDiff.current = e.targetTouches[0].pageX - areaNodeContext.node.current.offsetLeft;
        yMouseDiff.current = e.targetTouches[0].pageY - areaNodeContext.node.current.offsetTop;

        lastTouchX.current = e.targetTouches[0].pageX;
        lastTouchY.current = e.targetTouches[0].pageY;
        e.preventDefault();
        scrollLockID.current = BeginLockScrollbars();
    }, [areaNodeContext, onTouchMove, onTouchUp]);

    // Clean up event listeners when component unmounts
    useEffect(() => {
        return () => {
            if (moving.current) {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                EndLockScrollbars(scrollLockID.current);
            }
        };
    }, [onMouseMove, onMouseUp]);

    // Render the NodeMover component
    return (
        <div className={styles.node_mover}>
            <div
                className={styles.draggable_area}
                onMouseDown={onMouseDown as any}
                onTouchStart={onTouchDown as any}
                onTouchMove={onTouchMove as any}
                onTouchEnd={onTouchUp}
                onTouchCancel={onTouchUp}
            ></div>
            <div className={styles.rest}>{children}</div>
        </div>
    );
}