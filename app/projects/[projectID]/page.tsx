"use client"
import styles from "../../../styles/LoadedProjectPage.module.css";
import gridImage from "../../../public/grid.png";
import { useEffect, useLayoutEffect, useRef } from "react";
import Task from "../../../src/components/Task";


export default function LoadedProjectPage({ params }) {



    const movingBackground = useRef(false);
    const bgElement = useRef(null as HTMLElement);
    const contentSize = useRef([0, 0]);

    function onScroll() {
        console.log("Scroll X = " + document.documentElement.scrollLeft);
        console.log("Scroll Y = " + document.documentElement.scrollTop);
    }

    function onBackgroundClick(e: MouseEvent) {
        movingBackground.current = true;
    }

    function onBackgroundDrag(e: MouseEvent) {
        if (movingBackground.current) {
            document.documentElement.scrollBy(-e.movementX, -e.movementY);
        }
    }

    function onBackgroundRelease(e: MouseEvent) {
        movingBackground.current = false;
    }

    useLayoutEffect(() => {
        if (bgElement.current !== null) {
            bgElement.current.style.width = "max-content";
            bgElement.current.style.height = "max-content";
        }
    });

    useEffect(() => {
        if (bgElement.current === null) {
            bgElement.current = document.getElementsByClassName(styles.background)[0] as HTMLElement;
        }
        console.log("Background Width = " + bgElement.current.clientWidth);
        console.log("Background Height = " + bgElement.current.clientHeight);

        contentSize.current[0] = bgElement.current.clientWidth;
        contentSize.current[1] = bgElement.current.clientHeight;

        console.log("Bounding Rect = ");
        console.log(bgElement.current.getBoundingClientRect());
        bgElement.current.style.width = `calc(${bgElement.current.clientWidth}px)`;
        bgElement.current.style.height = `calc(${bgElement.current.clientHeight}px`;
    });

    useEffect(() => {
        document.addEventListener("scroll", onScroll);
        document.addEventListener("mousedown", onBackgroundClick);
        document.addEventListener("mousemove", onBackgroundDrag);
        document.addEventListener("mouseup", onBackgroundRelease);

        console.log("Scroll Width = " + bgElement.current.clientWidth);
        console.log("Scroll Height = " + bgElement.current.clientHeight);

        document.documentElement.scrollTo(contentSize.current[0] / 2, contentSize.current[1] / 2);
    }, []);

    return <div className={styles.background} style={{ backgroundImage: `url(${gridImage.src})` }}>
        <Task taskInfo={{ name: "Test", description: "Teset Description", project_id: params.projectID, x: 400, y: 400 }}></Task>
        <Task taskInfo={{ name: "Test", description: "Teset Description", project_id: params.projectID, x: -400, y: -400 }}></Task>
    </div>
}