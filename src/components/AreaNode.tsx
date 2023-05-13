import { createContext, MutableRefObject, useContext, useEffect, useMemo, useRef } from "react";
import styles from "../../styles/AreaNode.module.css";
import { ExpandableAreaContext } from "./ExpandableArea";

// Define the props for the AreaNode component
export interface AreaNodeProps {
    children?: any,
    left: number,
    top: number,
    width: number,
    height: number,
    id: string,
}

// Define the entry object for the nodes
export interface NodeEntry {
    x: number,
    y: number,
    width: number,
    height: number,
    node: MutableRefObject<HTMLElement>
}

// Define the context values for the AreaNode component
export interface AreaNodeContextValues {
    node: MutableRefObject<HTMLElement>,
    x: number,
    y: number,
    width: number,
    height: number
}

// Create the context for the AreaNode component
export const AreaNodeContext = createContext(null as AreaNodeContextValues);

// Define the AreaNode component
export default function AreaNode({ children, left, top, width, height, id }: AreaNodeProps) {
    const mainAreaContext = useContext(ExpandableAreaContext);

    const elementRef = useRef(null as HTMLElement);

    // Throw an error if the component is not wrapped inside an ExpandableArea
    if (!mainAreaContext) {
        throw "An Expandable Area Node is not inside of an Expandable Area";
    }

    // Throw an error if the component is missing the 'id' prop
    if (!id) {
        throw "A key is required for an Expandable Area Node";
    }

    // Create the context value for the AreaNode component
    const areaNodeContextValue: AreaNodeContextValues = useMemo(() => {
        return {
            node: elementRef,
            x: left,
            y: top,
            width: width,
            height: height
        };
    }, [left, top, width, height]);

    useEffect(() => {
        // Update the mainAreaContext with the node details
        mainAreaContext.nodes[id] = {
            x: left,
            y: top,
            width: width,
            height: height,
            node: elementRef
        }

        return () => {
            // Remove the node details from mainAreaContext on component unmount
            delete mainAreaContext.nodes[id];
        }
    }, [mainAreaContext, left, top, width, height, id]);

    return (
        <div
            ref={elementRef as any}
            className={styles.area_node}
            style={{ left: left, top: top, width: width, height: height }}
        >
            <AreaNodeContext.Provider value={areaNodeContextValue}>
                {children}
            </AreaNodeContext.Provider>
        </div>
    );
}
