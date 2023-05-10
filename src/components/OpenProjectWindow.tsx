import { Project } from "../global";
import { DisplayWindow } from "./DisplayWindow";

import styles from "../../styles/OpenProjectWindow.module.css"
import { useCallback, useState } from "react";
import LoadingIcon from "./LoadingIcon";
import ConfirmationBox from "./ConfirmationBox";



export interface OpenProjectWindowProps {
    project: Project,
    onCancel?: () => void,
    onOpen?: () => Promise<void>,
    onDelete?: () => void
}

export default function OpenProjectWindow({ project, onCancel, onOpen, onDelete} : OpenProjectWindowProps) {

    let [loading, setLoading] = useState(false);
    let [deleting, setDeleting] = useState(false);

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

    }, [onOpen]);

    const onConfirmDelete = useCallback(() => {
        setDeleting(true);
    }, []);

    const onDeleteConfirmed = useCallback(confirmed => {
        setDeleting(false);
        if (confirmed) {
            onDelete?.();
        }
    }, [onDelete]);

    return <DisplayWindow onClose={onCancel} title={project.name}>
        {!loading && <div className={styles.window_flex}>
            <h2 className={styles.description}>{project.description}</h2>
            <div className={styles.bottom_buttons_area}>
                <button className={`${styles.bottom_button} ${styles.delete_button}`} onClick={onConfirmDelete}>Delete Project</button>
                <button className={styles.bottom_button} onClick={openProject}>Open Project</button>
            </div>
        </div>}
        {loading && <LoadingIcon />}
        {deleting && <ConfirmationBox onConfirm={onDeleteConfirmed} bodyText="Are you sure you want to delete this project" />}
    </DisplayWindow>
}