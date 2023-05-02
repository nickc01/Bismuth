import styles from "../../styles/Task.module.css"

export interface TaskInfo {
    name: string,
    description: string,
    project_id: string,
    x: number,
    y: number
}

export interface TaskProps {
    taskInfo: TaskInfo
}


export default function Task({taskInfo} : TaskProps) {
    return <div className={styles.task} style={{left: `calc(${taskInfo.x}px + 50%)`, top: `calc(${taskInfo.y}px + 50%)`}}>

    </div>
}