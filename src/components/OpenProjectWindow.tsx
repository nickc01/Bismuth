import { Project } from "../global";
import { DisplayWindow } from "./DisplayWindow";

import styles from "../../styles/OpenProjectWindow.module.css"
import { useCallback, useState } from "react";
import LoadingIcon from "./LoadingIcon";
import ConfirmationBox from "./ConfirmationBox";
import EditableText from "./EditableText";



export interface OpenProjectWindowProps {
    project: Project,
    onCancel?: () => void,
    onOpen?: () => Promise<void>,
    onDelete?: () => void,
    onTitleTextChanged?: (newTitle: string) => void,
    onDescriptionTextChanged?: (newDesc: string) => void
}

export default function OpenProjectWindow({ project, onCancel, onOpen, onDelete, onTitleTextChanged = undefined, onDescriptionTextChanged = undefined }: OpenProjectWindowProps) {

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

    return <DisplayWindow onClose={onCancel} title={<EditableText textClass={styles.title_text} sizeLimit={128} onTextUpdate={onTitleTextChanged} text={project.name}></EditableText>}>
        {!loading && <div className={styles.window_flex}>
            <EditableText multiline={true} textClass={styles.description} onTextUpdate={onDescriptionTextChanged} text={project.description}></EditableText>
            <div className={styles.remaining_space}></div>
            <div className={styles.bottom_buttons_area}>
                <button className={`${styles.bottom_button} ${styles.delete_button}`} onClick={onConfirmDelete}>Delete Project</button>
                <button className={styles.bottom_button} onClick={openProject}>Open Project</button>
            </div>
        </div>}
        {loading && <LoadingIcon />}
        {deleting && <ConfirmationBox onConfirm={onDeleteConfirmed} bodyText="Are you sure you want to delete this project" />}
    </DisplayWindow>
}

//<h2 className={styles.description}>{project.description}</h2>