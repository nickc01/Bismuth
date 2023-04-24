import { Project } from "../global";
import { DisplayWindow } from "./DisplayWindow";

import styles from "../../styles/OpenProjectWindow.module.css"
import { useCallback, useState } from "react";
import LoadingIcon from "./LoadingIcon";



export interface OpenProjectWindowProps {
    project: Project,
    onClose?: () => void,
    onOpen?: () => Promise<void>
}

export default function OpenProjectWindow({project, onClose: onCancel, onOpen} : OpenProjectWindowProps) {

    let [loading, setLoading] = useState(false);

    const openProject = useCallback(async () => {
        setLoading(true);
        try {
            await onOpen();
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }

    },[onOpen]);

    return <DisplayWindow onClose={onCancel} title={project.name}>
        {!loading && <div className={styles.window_flex}>
            <h2 className={styles.description}>{project.description}</h2>
            <button className={styles.open_button} onClick={openProject}>Open Project</button>
        </div>}
        {loading && <LoadingIcon/>}
    </DisplayWindow>
}