import { MutableRefObject, createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/WireTerminal.module.css"
import { TaskInfo } from "./Task";
import { ExpandableAreaContext } from "./ExpandableArea";
import { getOffsetRelativeTo } from "../global";
import WireLine from "./WireLine";
import WireConnectionContext, { TerminalInfo, WireConnectionContextData } from "../WireConnectionContext";


/*const inputColor = "rgb(0,255,0,1)";
const outputColor = "rgb(255,0,0,1)";


export const wireConnectionContext = createContext({
    inputColor: "rgb(0,255,0,1)",
    outputColor: "rgb(255,0,0,1)",
});*/

/*let wireList: TerminalInfo[] = [];
let draggedWire: MutableRefObject<HTMLDivElement> = null;
let snappedID: string = null;
let onSnap: (info: TerminalInfo, x: number, y: number) => void = null;
let onUnsnap: () => void = null;
let snapTargets: SnapTargets = {};

function addSnapTarget(info: TerminalInfo, x: number, y: number): string {
    let id = crypto.randomUUID();
    snapTargets[id] = {
        x: x,
        y: y,
        terminalInfo: info
    }

    if (snappedID !== null) {
        if (draggedWire !== null) {
            onUnsnap?.();
        }

        snappedID = null;
    }

    snappedID = id;
    if (draggedWire !== null) {
        onSnap?.(info, x, y);
    }

    return id;
}

function removeSnapTarget(id: string) {
    if (id in snapTargets) {
        delete snapTargets[id];
    }

    if (draggedWire !== null) {
        onUnsnap?.();
    }
}

function startSnappingBehavior(sourceWire: MutableRefObject<HTMLDivElement>, snap: (info: TerminalInfo, x: number, y: number) => void, unsnap: () => void) {
    onSnap = snap;
    onUnsnap = unsnap;
    draggedWire = sourceWire;

    const keys = Object.keys(snapTargets);

    if (keys.length > 0) {
        snappedID = keys[0];
        onSnap?.(snapTargets[snappedID].terminalInfo, snapTargets[snappedID].x, snapTargets[snappedID].y);
    }
}

function stopSnappingBehavior() {
    if (snappedID !== null) {
        if (draggedWire !== null) {
            onUnsnap?.();
        }

        snappedID = null;
    }
    draggedWire = null;

    snapTargets = {};
}*/

/*function updateConnections(context: WireConnectionContextData, sourceWire: MutableRefObject<HTMLDivElement>) {

}*/



export interface WireTerminalProps {
    isInput: boolean,
    taskInfo: TaskInfo,
    addTaskDependency?: (source: TaskInfo, dependency: TaskInfo) => void,
    removeTaskDependencies?: (source: TaskInfo, dependencies: string[]) => void
}

export default function WireTerminal({ taskInfo, isInput, addTaskDependency, removeTaskDependencies }: WireTerminalProps) {

    //if (taskInfo.name == "Test1" && isInput) {
        //console.log("DEPENDENCIES = ");
        //console.log(taskInfo.dependsOn);
    //}
    const mainAreaContext = useContext(ExpandableAreaContext);
    const wireConnectionContext = useContext(WireConnectionContext);

    if (!mainAreaContext) {
        throw "This Wire Terminal must be within an Expandable Area";
    }

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
    //const [firstTime, setFirstTime] = useState(true);


    const [initialized, setInitialized] = useState(false);
    //const [taskUpdateCounter, setTaskUpdateCounter] = useState(0);
    //const [outputs, setOutputs] = useState(null as TerminalInfo[]);
    //const outputs = useRef(null as TerminalInfo[]);
    //const outputsDirty = useRef(false);
    //const [forceRenderCounter, setRenderCounter] = useState(0);



    const snappedTerminal = useRef(null as TerminalInfo);
    const snapTarget = useRef(null as string);
    const snapPosX = useRef(0);
    const snapPosY = useRef(0);


    /*const setOutputsDirty = () => {
        outputsDirty.current = true;
        setRenderCounter(prev => prev + 1);
    };*/




    const terminalInfo: TerminalInfo = useMemo(() => {
        //console.log("Removed = " + wireConnectionContext.removeLoadedTerminal(wireRef));
        const result = {
            ref: wireRef,
            isInput: isInput,
            taskInfo: taskInfo,
            origin: originRef
        };
        //console.log("Added = " + wireConnectionContext.addLoadedTerminal(result));
        //console.log("ADDED TERMINAL");
        return result;
    }, [taskInfo, isInput]);


    const generateConnections = useCallback((taskInfo: TaskInfo, terminalList: TerminalInfo[]) => {
        let newOutputs: TerminalInfo[] = [];
        //if (taskInfo.name == "Test1" && isInput) {
            //console.log("IS INPUT = " + isInput);
        //}
        if (isInput) {
            //if (taskInfo.name == "Test1" && isInput) {
                //console.log("Dependency Length = " + taskInfo.dependsOn.length);
                //console.log(terminalList);
                //console.log(terminalList.length);
                //console.log(terminalList[2]);
            //}

            let dependenciesToRemove: string[] = null;

            for (let i = taskInfo.dependsOn.length - 1; i >= 0; i--) {
                /*if (taskInfo.name == "Test1" && isInput) {
                    //console.log("Dependency = " + taskInfo.dependsOn[i]);
                    //console.log("TERMINAL SIZE = " + terminalList.length);

                    for (let j = terminalList.length - 1; j >= 0; j--) {
                        let t = terminalList[j];
                        //console.log("1 ID = " + t.taskInfo.task_id);
                        //console.log("2 ID = " + taskInfo.dependsOn[i]);
                        //console.log("ID EQUAL = " + (t.taskInfo.task_id === taskInfo.dependsOn[i]));
                        //console.log(`${j} match = ${t.taskInfo.task_id === taskInfo.dependsOn[i] && !t.isInput}`);
                    }
                }*/

                let dependentOutput = terminalList.findIndex(t => t.taskInfo.task_id === taskInfo.dependsOn[i] && !t.isInput);
                //if (taskInfo.name == "Test1" && isInput) {
                    //console.log("Dependent Output = " + dependentOutput);
                //}
                if (dependentOutput > -1) {
                    newOutputs.push(terminalList[dependentOutput]);
                    //console.log("OUTPUT ADDED");
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

    const outputs = useMemo(() => {
        if (initialized) {
            //console.log("INITIAL TASK = ");
            //console.log(taskInfo);
            return generateConnections(taskInfo, wireConnectionContext.terminalList);
        }
        return null;
    }, [initialized, taskInfo, wireConnectionContext, generateConnections]);

    /*let outputs = null;
    if (initialized) {
        outputs = regenOutputs(taskInfo, wireConnectionContext.terminalList);
    }*/

    /*const outputs = useMemo(() => {
        if (initialized) {
            //console.log("UPDATE");
            if (taskInfo.name == "Test1" && isInput) {
                console.log(taskInfo);
                console.log(wireConnectionContext);
            }
            let outputs = regenOutputs(taskInfo, wireConnectionContext.terminalList);

            if (taskInfo.name == "Test1" && isInput) {
                console.log(outputs);
            }
        }
        return null;
    }, [initialized, isInput, taskInfo, taskInfo.dependsOn, wireConnectionContext]);*/


    /*const enableSnapping = useCallback((enable: boolean) => {

    },[]);*/

    /*useEffect(() => {
        wireList.push(terminalInfo);
        return () => {
            wireList.splice(wireList.indexOf(terminalInfo), 1);
        }
    }, [terminalInfo]);*/

    const onSnap = useCallback((info: TerminalInfo, x: number, y: number) => {
        //console.log(`ON SNAP POS = ${snapPosX.current}, ${}`)
        if (info.isInput !== isInput && info.taskInfo.task_id !== taskInfo.task_id) {
            snapPosX.current = x;
            snapPosY.current = y;
            snappedTerminal.current = info;
            setSnapping(true);
        }
    }, [taskInfo, isInput]);

    const onUnSnap = useCallback(() => {
        //console.log("UNSNAPPING");
        snappedTerminal.current = null;
        setSnapping(false);
    },[]);

    const onMouseDrag = useCallback((e: MouseEvent) => {
        //console.log("MOUSE TASK DRAG");
        //console.log(taskInfo);
        e.preventDefault();

        setTargetPosX(prev => prev + (e.movementX * (1 / mainAreaContext.zoom)));
        setTargetPosY(prev => prev + (e.movementY * (1 / mainAreaContext.zoom)));
    }, [mainAreaContext]);

    let onMouseEnd = null;
    onMouseEnd = useCallback((e: MouseEvent) => {
        e.preventDefault();

        //console.log("MOUSE TASK END");
        //console.log(taskInfo);
        setDragging(false);

        window.removeEventListener("mousemove", onMouseDrag);
        window.removeEventListener("mouseup", onMouseEnd);

        if (snappedTerminal.current) {
            if (snappedTerminal.current.isInput) {
                //console.log(snappedTerminal.current.taskInfo);
                addTaskDependency(snappedTerminal.current.taskInfo, taskInfo);
            }
            else {
                //console.log(taskInfo);
                addTaskDependency(taskInfo, snappedTerminal.current.taskInfo);
            }
        }

        wireConnectionContext.stopSnappingBehavior();

        mainAreaContext.enableActions(true);
    }, [wireConnectionContext, addTaskDependency, mainAreaContext, onMouseDrag, onMouseEnd, taskInfo]);

    const onMouseStart = useCallback((e: MouseEvent) => {
        //console.log("MOUSE TASK START");
        //console.log(taskInfo);
        e.preventDefault();

        //const target = e.target as HTMLDivElement;

        mainAreaContext.enableActions(false);

        //const parent = (e.target as HTMLDivElement).parentElement.parentElement.parentElement;

        //const rect = (e.target as HTMLDivElement).getBoundingClientRect();
        
        //console.log("Rect = ");
        //console.log(rect);

        //let startX = parent.offsetLeft + (e.target as HTMLDivElement).parentElement.parentElement.offsetLeft;
        //let startY = parent.offsetTop + (e.target as HTMLDivElement).parentElement.parentElement.offsetTop;

        const { offsetLeft, offsetTop } = getOffsetRelativeTo(wireRef.current, mainAreaContext.ref.current);

        let startX = offsetLeft;
        let startY = offsetTop;

        /*if (snapTarget.current) {
            removeSnapTarget(snapTarget.current);
            snapTarget.current = null;
        }

        snapTarget.current = addSnapTarget(startX, startY);*/

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

    //const outputWireOffset = 42 //REM = 64
    //const outputWireOffset = 22; //REM = 32
    //const outputWireOffset = 13 //REM = 16;

    //const outputWire

    const outputWireOffsetOLD = 0;
    //const outputWireOffset = "0.8rem"; //16rem 12.8px
    //const outputWireOffset = "0.7rem"; //32rem 22.4px
    //const outputWireOffset = "0.65rem"; //64rem 42.8px
    const outputWireOffset = "0.2rem";

    const outputJSX = useMemo(() => {
        return outputs && outputs.map((o, i) => {

            const startOffsets = getOffsetRelativeTo(originRef.current, mainAreaContext.ref.current);
            const endOffsets = getOffsetRelativeTo(o.origin.current, mainAreaContext.ref.current);

            return <WireLine offset={outputWireOffset} wireID={o.taskInfo.task_id} onClick={removeTaskDependency} key={i.toString()} startX={startOffsets.offsetLeft + outputWireOffsetOLD} startY={startOffsets.offsetTop + outputWireOffsetOLD} endX={endOffsets.offsetLeft + outputWireOffsetOLD} endY={endOffsets.offsetTop + outputWireOffsetOLD} startColor={isInput ? wireConnectionContext.inputColor : wireConnectionContext.outputColor} endColor={isInput ? wireConnectionContext.outputColor : wireConnectionContext.inputColor} />
        });
    }, [outputs, wireConnectionContext, isInput, removeTaskDependency, mainAreaContext.ref]);

    //const offset = 16; //REM = 64
    //const offset = 9; //REM = 32
    // offset = 7; //REM = 16

    const oldOffset = 0;
    //const offset = "0.45rem"; //16rem 7.2px
    //const offset = "0.275rem"; //32rem 8.8px
    //const offset = "0.25rem"; //64rem 16px

    // -3 = 16px
    // -9 = 32px
    // -21 = 64px




    const offset = "1.6rem";



    /*

    0.125
    0.025
    */

    return <>
        <div ref={wireRef} className={styles.terminal} onMouseDown={onMouseStart as any} onMouseOver={onMouseOverSelf as any} onMouseLeave={onMouseLeaveSelf as any}>
            <div className={styles.terminal_color} style={{ backgroundColor: isInput ? wireConnectionContext.inputColor : wireConnectionContext.outputColor }}></div>
            <div ref={originRef} className={styles.origin}>
            </div>
        </div>
        {dragging && <WireLine offset={offset} key="dragging_line" startX={sourcePosX + oldOffset} startY={sourcePosY + oldOffset} endX={(snapping ? snapPosX.current : targetPosX) + oldOffset} endY={(snapping ? snapPosY.current : targetPosY) + oldOffset} startColor={isInput ? wireConnectionContext.inputColor : wireConnectionContext.outputColor} endColor={isInput ? wireConnectionContext.outputColor : wireConnectionContext.inputColor} />}
        {outputJSX}
    </>
}