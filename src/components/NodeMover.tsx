import { useCallback, useContext, useEffect, useRef } from "react";
import { AreaNodeContext } from "./AreaNode";

import styles from "../../styles/NodeMover.module.css";
import grip_dots from "../../public/grip_dots.png"
import { ExpandableAreaContext } from "./ExpandableArea";
import { BeginLockScrollbars, EndLockScrollbars } from "../global";


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
    const scrollLockID = useRef(null as string);
    const lastTouchX = useRef(0);
    const lastTouchY = useRef(0);
    //const oldScrollX = useRef(0);
    //const oldScrollY = useRef(0);

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

    /*const mobile_disableScrolling = useCallback((e: UIEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.scrollTo(oldScrollX.current, oldScrollY.current);
    },[]);*/

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (!moving.current) {
            return;
        }

        e.preventDefault();
        //e.stopPropagation();
        //e.preventDefault();
        let xDiff = e.targetTouches[0].pageX - oldX.current;
        let yDiff = e.targetTouches[0].pageY - oldY.current;

        let newX = oldX.current + (xDiff * (1 / expandAreaContext.zoom));
        let newY = oldY.current + (yDiff * (1 / expandAreaContext.zoom));

        lastTouchX.current = e.targetTouches[0].pageX;
        lastTouchY.current = e.targetTouches[0].pageY;

        areaNodeContext.node.current.style.left = `${(newX - xMouseDiff.current)}px`;
        areaNodeContext.node.current.style.top = `${(newY - yMouseDiff.current)}px`;
    }, [areaNodeContext, expandAreaContext.zoom]);

    let onTouchUp = null;
    onTouchUp = useCallback((e: TouchEvent) => {
        if (moving.current) {
            //e.stopPropagation();
            //e.preventDefault();
            e.preventDefault();
            moving.current = false;
            //document.removeEventListener("touchmove", onTouchMove);
            //document.removeEventListener("touchend", onTouchUp);
            //window.removeEventListener("scroll", mobile_disableScrolling);
            EndLockScrollbars(scrollLockID.current);

            let xDiff = lastTouchX.current - oldX.current;
            let yDiff = lastTouchY.current - oldY.current;

            let newX = oldX.current + (xDiff * (1 / expandAreaContext.zoom));
            let newY = oldY.current + (yDiff * (1 / expandAreaContext.zoom));

            onUpdatePosition(areaNodeContext.x + (newX - oldX.current), areaNodeContext.y + (newY - oldY.current));
        }
    }, [areaNodeContext, onUpdatePosition, onTouchMove, expandAreaContext.zoom, onTouchMove]);

    const onTouchDown = useCallback((e: TouchEvent) => {
        //e.stopPropagation();
        //e.preventDefault();
        moving.current = true;
        oldX.current = e.targetTouches[0].pageX;
        oldY.current = e.targetTouches[0].pageY;
        xMouseDiff.current = e.targetTouches[0].pageX - areaNodeContext.node.current.offsetLeft;
        yMouseDiff.current = e.targetTouches[0].pageY - areaNodeContext.node.current.offsetTop;

        lastTouchX.current = e.targetTouches[0].pageX;
        lastTouchY.current = e.targetTouches[0].pageY;
        //document.addEventListener("touchmove", onTouchMove);
        //document.addEventListener("touchend", onTouchUp);
        //oldScrollX.current = window.scrollX;
        //oldScrollY.current = window.scrollY;
        //window.addEventListener("scroll", mobile_disableScrolling);
        e.preventDefault();
        scrollLockID.current = BeginLockScrollbars();
    }, [areaNodeContext, onTouchMove, onTouchUp]);

    useEffect(() => {
        return () => {
            if (moving.current) {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                //document.removeEventListener("touchmove", onTouchMove);
                //document.removeEventListener("touchend", onTouchUp);
                EndLockScrollbars(scrollLockID.current);
            }
        }
    }, [onMouseMove, onMouseUp]);

    return <div className={styles.node_mover}>
        <div className={styles.draggable_area} onMouseDown={onMouseDown as any} onTouchStart={onTouchDown as any} onTouchMove={onTouchMove as any} onTouchEnd={onTouchUp} onTouchCancel={onTouchUp}>
            
        </div>
        <div className={styles.rest}>
            {children}
        </div>
    </div>
}