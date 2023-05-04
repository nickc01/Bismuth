"use client"
import styles from "../../../styles/LoadedProjectPage.module.css";
import gridImage from "../../../public/grid.png";
import { useEffect, useLayoutEffect, useRef, useCallback, useState, useMemo } from "react";
import Task, { TaskInfo } from "../../../src/components/Task";
import ExpandableArea from "../../../src/components/ExpandableArea";
import ZoomControls from "../../../src/components/ZoomControls";


/*const BACKGROUND_PADDING = 750;


function onScroll() {
    console.log("Scroll X = " + document.documentElement.scrollLeft);
    console.log("Scroll Y = " + document.documentElement.scrollTop);
}*/

/*function renderTaskInfo(tasks: TaskInfo[]) {
    for (let i = 0; i < tasks.length; i++) {
        tasks[i].innerHTML = <Task key={t.id} xOffset={bounds.x - BACKGROUND_PADDING} yOffset={bounds.y - BACKGROUND_PADDING} taskInfo={t}></Task>
    }
}*/

function generateStartingTasks(projectID: string): TaskInfo[] {
    return [
        { width: 300, height: 600, name: "Test1", description: "Test1 Description", project_id: projectID, x: 400, y: 400, id: "ID_1" },
        { width: 300, height: 600, name: "Test2", description: "Test2 Description jfkjdshaf dsf dsf ds f sd f sd f ds f sd f sd fsd f sd f ds f sd f d f sd f sd f sd f d f sd f dsf sd ff dsf  sdf f sda fg asd f sd f sd f sd df sd f ", project_id: projectID, x: -400, y: -400, id: "ID_2" },
        { width: 300, height: 600, name: "Test3", description: "Test3 Description", project_id: projectID, x: 0, y: 0, id: "ID_3" }
    ];
}

/*type Rect = {
    x: number,
    y: number,
    width: number,
    height: number
}

function calculateBounds(tasks: TaskInfo[]): Rect {
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].x < minX) {
            minX = tasks[i].x;
        }
        if (tasks[i].y < minY) {
            minY = tasks[i].y;
        }
        if (tasks[i].x + tasks[i].width > maxX) {
            maxX = tasks[i].x + tasks[i].width;
        }
        if (tasks[i].y + tasks[i].height > maxY) {
            maxY = tasks[i].y + tasks[i].height;
        }
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}*/

//<ZoomControls onZoom={setZoom} dest_id="task_area_input_grabber" />
export default function LoadedProjectPage({ params }) {


    let [tasks, setTasks] = useState(generateStartingTasks(params.projectID));

    //let [zoom, setZoom] = useState(1);

    return <>
        <ExpandableArea zoomable={true} id="task_area">
            {tasks.map(t => <Task onTaskUpdated={() => setTasks(tasks.slice())} key={t.id} taskInfo={t}></Task>)}
        </ExpandableArea>
        
    </>
    /*const movingBackground = useRef(false);
    const bgElement = useRef(null as HTMLElement);



    const bounds = useMemo(() => calculateBounds(tasks), [tasks]);

    const onBackgroundClick = useCallback((e: MouseEvent) => {
        if (e.target === bgElement.current) {
            movingBackground.current = true;
        }
    }, []);

    const onBackgroundDrag = useCallback((e: MouseEvent) => {
        if (movingBackground.current) {
            document.documentElement.scrollBy(-e.movementX, -e.movementY);
        }
    }, []);

    const onBackgroundRelease = useCallback((e: MouseEvent) => {
        movingBackground.current = false;
    }, []);

    useEffect(() => {
        if (bgElement.current === null) {
            bgElement.current = document.getElementsByClassName(styles.background)[0] as HTMLElement;
        }
        console.log(bounds);
        console.log(bgElement.current.getBoundingClientRect());
        bgElement.current.style.width = `max(${bounds.width + (BACKGROUND_PADDING * 2)}px, 100%)`;
        bgElement.current.style.height = `max(${bounds.height + (BACKGROUND_PADDING * 2)}px, 100vh)`;
    });

    useEffect(() => {
        document.addEventListener("mousedown", onBackgroundClick);
        document.addEventListener("mousemove", onBackgroundDrag);
        document.addEventListener("mouseup", onBackgroundRelease);

        let centerScrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        let centerScrollY = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        document.documentElement.scrollTo(centerScrollX / 2, centerScrollY / 2);
    }, []);

    return <div className={styles.background} style={{ backgroundImage: `url(${gridImage.src})` }}>
        {tasks.map(t => <Task key={t.id} xOffset={bounds.x - BACKGROUND_PADDING} yOffset={bounds.y - BACKGROUND_PADDING} taskInfo={t}></Task>)}
    </div>*/
}

/*
 <Task taskInfo={{ width: 200, height: 100, name: "Test", description: "Teset Description", project_id: params.projectID, x: 400, y: 400 }}></Task>
 <Task taskInfo={{ width: 200, height: 100, name: "Test", description: "Teset Description", project_id: params.projectID, x: -400, y: -400 }}></Task>
*/