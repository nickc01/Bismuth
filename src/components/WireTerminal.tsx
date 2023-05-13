import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/WireTerminal.module.css"
import { TaskInfo } from "./Task";
import { ExpandableAreaContext } from "./ExpandableArea";
import { getOffsetRelativeTo } from "../global";
import WireLine from "./WireLine";
import WireConnectionContext, { TerminalInfo } from "../WireConnectionContext";

// Define the props for the WireTerminal component
export interface WireTerminalProps {
    isInput: boolean, // Indicates whether the terminal is an input or output
    taskInfo: TaskInfo, // Information about the task associated with the terminal
    addTaskDependency?: (source: TaskInfo, dependency: TaskInfo) => void, // Function to add a task dependency
    removeTaskDependencies?: (source: TaskInfo, dependencies: string[]) => void // Function to remove task dependencies
}

// Define the WireTerminal component
export default function WireTerminal({ taskInfo, isInput, addTaskDependency, removeTaskDependencies }: WireTerminalProps) {
    const mainAreaContext = useContext(ExpandableAreaContext); // Access the ExpandableAreaContext
    const wireConnectionContext = useContext(WireConnectionContext); // Access the WireConnectionContext

    // Throw an error if the Wire Terminal is not within an Expandable Area
    if (!mainAreaContext) {
        throw "This Wire Terminal must be within an Expandable Area";
    }

    // Throw an error if the Wire Terminal is not within a Wire Connection Context
    if (!wireConnectionContext) {
        throw "This Wire Terminal must be within a Wire Connection Context to allow for terminal connections to work";
    }

    const wireRef = useRef(null as HTMLDivElement);
    const originRef = useRef(null as HTMLDivElement);
    const [sourcePosX, setSourcePosX] = useState(0);
    const [sourcePosY, setSourcePosY] = useState(0);
    const [targetPosX, setTargetPosX] = useState(0);
    const [targetPosY, setTargetPosY] = useState(0);
    const [snapping, setSnapping] = useState(false);
    const [dragging, setDragging] = useState(false);

    const [initialized, setInitialized] = useState(false);

    const snappedTerminal = useRef(null as TerminalInfo);
    const snapTarget = useRef(null as string);
    const snapPosX = useRef(0);
    const snapPosY = useRef(0);

    // Memoize the terminal info to avoid unnecessary re-rendering
    const terminalInfo: TerminalInfo = useMemo(() => {
        const result = {
            ref: wireRef,
            isInput: isInput,
            taskInfo: taskInfo,
            origin: originRef
        };
        return result;
    }, [taskInfo, isInput]);

    // Generate the connections based on the task info and the terminal list
    const generateConnections = useCallback((taskInfo: TaskInfo, terminalList: TerminalInfo[]) => {
        let newOutputs: TerminalInfo[] = [];
        if (isInput) {

            let dependenciesToRemove: string[] = null;

            for (let i = taskInfo.dependsOn.length - 1; i >= 0; i--) {

                let dependentOutput = terminalList.findIndex(t => t.taskInfo.task_id === taskInfo.dependsOn[i] && !t.isInput);
                if (dependentOutput > -1) {
                    newOutputs.push(terminalList[dependentOutput]);
                }
                else {
                    if (dependenciesToRemove === null) {
                        dependenciesToRemove = [taskInfo.dependsOn[i]];
                    }
                    else {
                        dependenciesToRemove.push(taskInfo.dependsOn[i]);
                    }
                }
            }

            if (dependenciesToRemove !== null) {
                removeTaskDependencies?.(taskInfo, dependenciesToRemove);
            }
        }

        return newOutputs;
    }, [isInput, removeTaskDependencies]);

    // Get the outputs based on the initialized state and task information
    const outputs = useMemo(() => {
        if (initialized) {
            return generateConnections(taskInfo, wireConnectionContext.terminalList);
        }
        return null;
    }, [initialized, taskInfo, wireConnectionContext, generateConnections]);

    // Callback function for snapping behavior when dragging a wire
    const onSnap = useCallback((info: TerminalInfo, x: number, y: number) => {
        if (info.isInput !== isInput && info.taskInfo.task_id !== taskInfo.task_id) {
            snapPosX.current = x;
            snapPosY.current = y;
            snappedTerminal.current = info;
            setSnapping(true);
        }
    }, [taskInfo, isInput]);

    // Callback function for unsnapping behavior
    const onUnSnap = useCallback(() => {
        snappedTerminal.current = null;
        setSnapping(false);
    }, []);

    // Callback function for handling mouse dragging event
    const onMouseDrag = useCallback((e: MouseEvent) => {
        e.preventDefault();

        setTargetPosX(prev => prev + (e.movementX * (1 / mainAreaContext.zoom)));
        setTargetPosY(prev => prev + (e.movementY * (1 / mainAreaContext.zoom)));
    }, [mainAreaContext]);

    // Callback function for handling mouse release event
    let onMouseEnd = null;
    onMouseEnd = useCallback((e: MouseEvent) => {
        e.preventDefault();

        setDragging(false);

        window.removeEventListener("mousemove", onMouseDrag);
        window.removeEventListener("mouseup", onMouseEnd);

        if (snappedTerminal.current) {
            if (snappedTerminal.current.isInput) {
                addTaskDependency(snappedTerminal.current.taskInfo, taskInfo);
            }
            else {
                addTaskDependency(taskInfo, snappedTerminal.current.taskInfo);
            }
        }

        wireConnectionContext.stopSnappingBehavior();

        mainAreaContext.enableActions(true);
    }, [wireConnectionContext, addTaskDependency, mainAreaContext, onMouseDrag, onMouseEnd, taskInfo]);

    // Callback function for handling mouse press event
    const onMouseStart = useCallback((e: MouseEvent) => {
        e.preventDefault();

        mainAreaContext.enableActions(false);

        const { offsetLeft, offsetTop } = getOffsetRelativeTo(wireRef.current, mainAreaContext.ref.current);

        let startX = offsetLeft;
        let startY = offsetTop;

        setSourcePosX(startX);
        setSourcePosY(startY);

        setTargetPosX(startX);
        setTargetPosY(startY);

        setSnapping(false);

        setDragging(true);

        window.addEventListener("mousemove", onMouseDrag);
        window.addEventListener("mouseup", onMouseEnd);

        snappedTerminal.current = null;
        wireConnectionContext.startSnappingBehavior(wireRef, onSnap, onUnSnap);
    }, [mainAreaContext, wireConnectionContext, onMouseDrag, onMouseEnd, onSnap, onUnSnap]);

    // Callback function for handling mouse over event on the wire itself
    const onMouseOverSelf = useCallback((e: MouseEvent) => {
        e.preventDefault();

        if (e.target !== wireRef.current) {
            return;
        }

        const { offsetLeft, offsetTop } = getOffsetRelativeTo(wireRef.current, mainAreaContext.ref.current);

        if (snapTarget.current) {
            wireConnectionContext.removeSnapTarget(snapTarget.current);
            snapTarget.current = null;
        }

        snapTarget.current = wireConnectionContext.addSnapTarget(terminalInfo, offsetLeft, offsetTop);

    }, [mainAreaContext, terminalInfo, wireConnectionContext]);

    // Callback function for handling mouse leave event on the wire itself
    const onMouseLeaveSelf = useCallback((e: MouseEvent) => {
        e.preventDefault();

        if (e.target !== wireRef.current) {
            return;
        }

        if (snapTarget.current) {
            wireConnectionContext.removeSnapTarget(snapTarget.current);
            snapTarget.current = null;
        }

    }, [wireConnectionContext]);

    const removeTaskDependency = useCallback((dependency: string) => {
        removeTaskDependencies?.(taskInfo, [dependency]);
    }, [taskInfo, removeTaskDependencies]);


    //Called on the first render before useEffect. This is used to add the terminal to a global list for connectivity later
    useLayoutEffect(() => {
        wireConnectionContext.addLoadedTerminal(terminalInfo);

        return () => {
            wireConnectionContext.removeLoadedTerminal(wireRef);
        };
    }, [terminalInfo, wireConnectionContext]);

    //Called on the first render after useLayoutEffect. By this point, ALL terminals within the context should be added to the terminal list within the context
    useEffect(() => {
        //Now that it is initialized, do a second pass to render connections
        setInitialized(true);
    }, []);


    useEffect(() => {
        return () => {
            window.removeEventListener("mousemove", onMouseDrag);
            window.removeEventListener("mouseup", onMouseEnd);

            if (snapTarget.current) {
                wireConnectionContext.removeSnapTarget(snapTarget.current);
            }

            mainAreaContext.enableActions(true);
        }
    }, [mainAreaContext, wireConnectionContext, onMouseDrag, onMouseEnd]);
    const outputWireOffset = "0.2rem";

    const outputJSX = useMemo(() => {
        return outputs && outputs.map((o, i) => {

            const startOffsets = getOffsetRelativeTo(originRef.current, mainAreaContext.ref.current);
            const endOffsets = getOffsetRelativeTo(o.origin.current, mainAreaContext.ref.current);

            return <WireLine offset={outputWireOffset} wireID={o.taskInfo.task_id} onClick={removeTaskDependency} key={i.toString()} startX={startOffsets.offsetLeft} startY={startOffsets.offsetTop} endX={endOffsets.offsetLeft} endY={endOffsets.offsetTop} startColor={isInput ? wireConnectionContext.inputColor : wireConnectionContext.outputColor} endColor={isInput ? wireConnectionContext.outputColor : wireConnectionContext.inputColor} />
        });
    }, [outputs, wireConnectionContext, isInput, removeTaskDependency, mainAreaContext.ref]);


    const offset = "1.6rem";

    return <>
        <div ref={wireRef} className={styles.terminal} onMouseDown={onMouseStart as any} onMouseOver={onMouseOverSelf as any} onMouseLeave={onMouseLeaveSelf as any}>
            <div className={styles.terminal_color} style={{ backgroundColor: isInput ? wireConnectionContext.inputColor : wireConnectionContext.outputColor }}></div>
            <div ref={originRef} className={styles.origin}>
            </div>
        </div>
        {dragging && <WireLine offset={offset} key="dragging_line" startX={sourcePosX} startY={sourcePosY} endX={(snapping ? snapPosX.current : targetPosX)} endY={(snapping ? snapPosY.current : targetPosY)} startColor={isInput ? wireConnectionContext.inputColor : wireConnectionContext.outputColor} endColor={isInput ? wireConnectionContext.outputColor : wireConnectionContext.inputColor} />}
        {outputJSX}
    </>
}