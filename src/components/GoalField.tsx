import { ChangeEvent, useCallback, useState } from "react"
import styles from "../../styles/GoalField.module.css"
import EditableText from "./EditableText"
import { GoalInfo } from "./Task"
import ConfirmationBox from "./ConfirmationBox"



export interface GoalFieldProps {
    goalInfo: GoalInfo
    onNameChange?: (name: string, goalInfo: GoalInfo) => void,
    onCompletionChange?: (completion: boolean, goalInfo: GoalInfo) => boolean,
    onDelete?: (goal: GoalInfo) => void
}

export default function GoalField({ goalInfo, onNameChange = null, onCompletionChange = null, onDelete = null }: GoalFieldProps) {

    const [deleting, setDeleting] = useState(false);

    const onCheckboxUpdate = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        if (onCompletionChange?.(e.target.checked, goalInfo)) {
            goalInfo.checked = e.target.checked;
        }
    }, [goalInfo, onCompletionChange]);

    const onNameUpdate = useCallback((str: string) => {
        goalInfo.name = str;
        onNameChange?.(str, goalInfo);
    }, [goalInfo, onNameChange]);

    const onConfirmDelete = useCallback(confirmed => {
        if (confirmed) {
            onDelete?.(goalInfo);
        }
        setDeleting(false);
    }, [goalInfo, onDelete]);

    const onStartDelete = useCallback(() => {
        setDeleting(true);
    },[]);

    return <>
            <div className={styles.goal_field}>
            <input type="checkbox" checked={goalInfo.checked} onChange={onCheckboxUpdate}></input>
            <div className={styles.text_container}>
                <EditableText text={goalInfo.name} onTextUpdate={onNameUpdate} multiline={false} />
            </div>
            <div className={styles.delete_goal_button} onClick={onStartDelete}>
                <div className={styles.x_line}/>
                <div className={`${styles.x_line} ${styles.x_line_right}`}/>
            </div>
        </div>
        {deleting && <ConfirmationBox onConfirm={onConfirmDelete} bodyText="Are you sure you want to delete this goal?"/>}
    </>
}