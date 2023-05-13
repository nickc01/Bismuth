import { useMemo, useState } from "react";
import styles from "../../styles/GuideArea.module.css";

import image1 from "../../public/guide/1 Create Task.png";
import image2 from "../../public/guide/2 - Task Created.png";
import image3 from "../../public/guide/3 - Edit Text.png";
import image4 from "../../public/guide/4 - Moving Tasks.png";
import image5 from "../../public/guide/5 - Resizing Tasks.png";
import image6 from "../../public/guide/6 - Closing Tasks.png";
import image7 from "../../public/guide/7 - Adding Goals.png";
import image8 from "../../public/guide/8 - Editing Goals.png";
import image9 from "../../public/guide/9 - Closing Goals.png";
import image10 from "../../public/guide/10 Enable Zoom Controls.png";
import image11 from "../../public/guide/11 Disable Wire Mode.png";
import image12 from "../../public/guide/12 - Exit Button.png";
import basicControls from "../../public/guide/Basic Controls Zoom.png";
import Image, { StaticImageData } from "next/image";
import ZoomBasedDiv from "./ZoomBasedDiv";

enum GuideType {
    Image,
    Video
}

export interface GuideAreaProps {

}


export interface GuidePage {
    resource: StaticImageData | string,
    description: string,
    type?: GuideType
}

function GenerateGuides(): GuidePage[] {
    return [
        {
            resource: image1,
            description: "Welcome to Bismuth! Click on the \"Create Task\" button to get started",
        },
        {
            resource: image2,
            description: "This will create a blank task that we can edit",
        },
        {
            resource: image3,
            description: "You can hover and click on the task title and description to edit the text",
        },
        {
            resource: image4,
            description: "Click and drag the top bar of a task to move it around",
        },
        {
            resource: image5,
            description: "Click and drag the bottom-right triangle to resize the task",
        },
        {
            resource: basicControls,
            description: "Basic Controls: Click and drag the background to move around. Use the mouse wheel or click on the + or - buttons at the bottom-right corner to zoom in and out",
        },
        {
            resource: image6,
            description: "Click on the x in the top-right corner to delete the task",
        },
        {
            resource: image7,
            description: "Click on \"Add Goal\" to add a goal to the task. Goals are checkable requirements for a task.",
        },
        {
            resource: image8,
            description: "Hover and click on the goal text to modify it.",
        },
        {
            resource: image9,
            description: "You can delete a goal by hovering over the goal text and clicking on the \"X\" on the right",
        },
        {
            resource: image10,
            description: "Click on \"Enable Wire Mode\" to switch to wire mode",
        },
        {
            resource: "https://firebasestorage.googleapis.com/v0/b/bismuth-d26ef.appspot.com/o/Content%2FSetting%20Up%20Wires.m4v?alt=media&token=74a81177-be45-471d-b1b2-a3d78662ebd8",
            type: GuideType.Video,
            description: "Wires are used to setup dependencies. You can drag a wire from a green terminal to a red terminal to make a task require another before it can be completed",
        },
        {
            resource: "https://firebasestorage.googleapis.com/v0/b/bismuth-d26ef.appspot.com/o/Content%2FSetting%20Up%20Wires.m4v?alt=media&token=74a81177-be45-471d-b1b2-a3d78662ebd8",
            type: GuideType.Video,
            description: "When a wire connection has been made, you can delete the connection by clicking on the wire",
        },
        {
            resource: image11,
            description: "Tasks cannot be moved or resized in wire mode. You need to disable wire mode by going to \"Disable Wire Mode\"",
        },
        {
            resource: image12,
            description: "Finally, you can exit back to the project page by clicking on the exit button. All of your changes are auto-saved",
        }
    ]
}

export default function GuideArea({ }: GuideAreaProps) {

    const [open, setOpen] = useState(false);
    const [guideIndex, setGuideIndex] = useState(0);


    const guides = useMemo(() => {
        return GenerateGuides();
    },[]);


    if (open) {
        return <ZoomBasedDiv transformOrigin={"0 100%"} mainClass={styles.guide_area}>
            <div className={styles.image_container}>
                {guides[guideIndex].type !== GuideType.Video && <Image src={guides[guideIndex].resource} alt="Guide Image" height={11 * 16} width={20 * 16} />}
                {guides[guideIndex].type === GuideType.Video && <video controls autoPlay loop muted src={guides[guideIndex].resource as string}>
                    
                </video>}
            </div>
            <p>{guides[guideIndex].description}</p>
            <div className={styles.button_container}>
                <button onClick={() => setGuideIndex(prev => guideIndex > 0 ? prev - 1 : prev)}>{"\<"}</button>
                <button onClick={() => setOpen(false)}>Close</button>
                <button onClick={() => setGuideIndex(prev => guideIndex < guides.length - 1 ? prev + 1 : prev)}>{"\>"}</button>
                </div>
        </ZoomBasedDiv>
    }
    else {
        return <ZoomBasedDiv transformOrigin={"0 100%"} mainClass={styles.guide_area_closed}>
            <button onClick={() => setOpen(true)}>
            Quick Start Guide
            </button>
        </ZoomBasedDiv>
    }

}