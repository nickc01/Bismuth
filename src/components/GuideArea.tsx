import { useMemo, useState } from "react";
import styles from "../../styles/GuideArea.module.css";

export interface GuideAreaProps {

}


export interface GuidePage {
    imageURL: string,
    description: string
}

function GenerateGuides(): GuidePage[] {
    return [
        {
            imageURL: null,
            description: "Test Description 1",
        },
        {
            imageURL: null,
            description: "Test Description 2",
        },
        {
            imageURL: null,
            description: "Test Description 3",
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
        return <div className={styles.guide_area}>
            <div className={styles.image_container}>
            </div>
            <p>{guides[guideIndex].description}</p>
            <div className={styles.button_container}>
                <button>{"\<"}</button>
                <button onClick={() => setOpen(false)}>Close</button>
                <button>{"\>"}</button>
            </div>
        </div>
    }
    else {
        return <button className={styles.guide_area_closed} onClick={() => setOpen(true)}>
            Quick Start Guide
        </button>
    }

}