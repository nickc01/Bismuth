import { useCallback} from "react";

import styles from "../../styles/ProjectSelector.module.css"
import { Project } from "../global";

export interface ProjectSelectorProps {
    onProjectSelect?: (projectID: string) => void,
    projects: Project[]
}

export default function ProjectSelector({ onProjectSelect, projects }: ProjectSelectorProps) {

    const selectProject = useCallback((projectID: string) => {
        let index = projects.findIndex(p => p.id == projectID);
        if (index >= 0 && onProjectSelect != null) {
            onProjectSelect(projects[index].id);
        }
    },[onProjectSelect, projects]);


    return <div className={styles.project_selector} style={{width: "40rem"}}>
        <h1>Projects</h1>
        <div className={styles.project_container}>
            {projects.map(p => {
                return (<div className={`${styles.project} unselectable`} onClick={() => selectProject(p.id)} key={p.id}>
                    <h1>{p.name}</h1>
                    <p>{p.description}</p>
                </div>);
            })}
        </div>
    </div>
}