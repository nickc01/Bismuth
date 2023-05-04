import { createContext, MutableRefObject, useContext, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/AreaNode.module.css";
import { ExpandableAreaContext } from "./ExpandableArea";

export interface AreaNodeProps {
    children?: any,
    left: number,
    top: number,
    width: number,
    height: number,
    id: string,
}

export interface NodeEntry {
    x: number,
    y: number,
    width: number,
    height: number,
    node: MutableRefObject<HTMLElement>
}

export interface AreaNodeContextValues {
    node: MutableRefObject<HTMLElement>,
    x: number,
    y: number,
    width: number,
    height: number
}

export const AreaNodeContext = createContext(null as AreaNodeContextValues);

export default function AreaNode({ children, left, top, width, height, id }: AreaNodeProps) {

    const mainAreaContext = useContext(ExpandableAreaContext);

    const elementRef = useRef(null as HTMLElement);

    if (!mainAreaContext) {
        throw "An Expandable Area Node is not inside of an Expandable Area";
    }

    if (!id) {
        throw "A key is required for an Expandable Area Node";
    }

    const areaNodeContextValue: AreaNodeContextValues = useMemo(() => {
        return {
            node: elementRef,
            x: left,
            y: top,
            width: width,
            height: height
        };
    },[left,top,width,height]);


    useEffect(() => {
        mainAreaContext.nodes[id] = {
            x: left,
            y: top,
            width: width,
            height: height,
            node: elementRef
        }

        return () => {
            delete mainAreaContext.nodes[id];
        }
    });

    return <div ref={elementRef as any} className={styles.area_node} style={{ left: left, top: top, width: width, height: height }}>
        <AreaNodeContext.Provider value={areaNodeContextValue}>
            {children}
        </AreaNodeContext.Provider>
    </div>;
}