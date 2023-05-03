import { useRef, useCallback, useState, useContext, useEffect } from "react";
import styles from "../../styles/Task.module.css"
import { ExpandableAreaContext, Rect } from "./ExpandableArea";
import AreaNode from "./AreaNode";
import NodeMover from "./NodeMover";
import NodeResizer from "./NodeResizer";

export interface TaskInfo extends Rect {
    name: string,
    description: string,
    project_id: string,
    id: string
}

export interface TaskProps {
    taskInfo: TaskInfo,
    onTaskUpdated: () => void
}


export default function Task({ taskInfo, onTaskUpdated }: TaskProps) {

    //const result = useContext(ExpandableAreaContext);
    //console.log("Result = ");
    //console.log(result);

    //const [xDiff, setXDiff] = useState(0);
    //const [yDiff, setYDiff] = useState(0);
    //const taskDiv = useRef(null as HTMLElement);
    //const movingTask = useRef(false);


    /*const onTaskClick = useCallback((e: MouseEvent) => {
        if (e.target === taskDiv.current) {
            setXDiff(0);
            setYDiff(0);
            movingTask.current = true;
        }
    }, []);

    const onTaskDrag = useCallback((e: MouseEvent) => {
        if (movingTask.current) {
            //document.documentElement.scrollBy(-e.movementX, -e.movementY);
            console.log("XDiff = " + xDiff);
            console.log("YDiff = " + yDiff);
            setXDiff(xDiff + e.movementX);
            setYDiff(yDiff + e.movementY);
        }
    }, []);

    const onTaskRelease = useCallback((e: MouseEvent) => {
        movingTask.current = false;
        onDrag?.(xDiff, yDiff);
    }, []);*/
    //console.log("TaskInfo = ");
    //console.log(taskInfo);

    const onUpdatePosition = useCallback((x: number, y: number) => {
        taskInfo.x = x;
        taskInfo.y = y;
        onTaskUpdated?.();
    }, [taskInfo]);

    const onUpdateSize = useCallback((width: number, height: number) => {
        taskInfo.width = width;
        taskInfo.height = height;
        onTaskUpdated?.();
    }, [taskInfo]);

    /*return <AreaNode id={taskInfo.id} left={taskInfo.x} top={taskInfo.y} width={taskInfo.width} height={taskInfo.height}>
        <NodeResizer onUpdateSize={onUpdateSize}>
            <div className={styles.task}>
                <h1>{taskInfo.name}</h1>
                <p>{taskInfo.description}</p>
            </div>
        </NodeResizer>
    </AreaNode>*/

    return <AreaNode id={taskInfo.id} left={taskInfo.x} top={taskInfo.y} width={taskInfo.width} height={taskInfo.height}>
        <NodeMover onUpdatePosition={onUpdatePosition}>
            <NodeResizer onUpdateSize={onUpdateSize}>
                <div className={styles.task}>
                    <h1>{taskInfo.name}</h1>
                    <p>{taskInfo.description}</p>
                </div>
            </NodeResizer>
        </NodeMover>
    </AreaNode>

    /*
    <div className={styles.task}>
            
    </div>
    */

    /*return <div ref={taskDiv as any} onMouseDown={onTaskClick as any} onMouseMove={onTaskDrag as any} onMouseUp={onTaskRelease as any} className={styles.task} style={{ width: `${taskInfo.width}px`, height: `${taskInfo.height}px`, left: `${taskInfo.x - xOffset + xDiff}px`, top: `${taskInfo.y - yOffset + yDiff}px` }}>
        
    </div>*/
}