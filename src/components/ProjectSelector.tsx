import { collection, onSnapshot, query, where} from "firebase/firestore"
import { db, onFirebaseInit } from "../../firebase/firebase_init"
import { useCallback, useEffect, useState } from "react";

import styles from "../../styles/ProjectSelector.module.css"
import { useRouter } from "next/navigation";
import LoadingIcon from "./LoadingIcon";
import { Project, readProjectFromData } from "../global";

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

    /*if (!loaded) {
        return <div className={styles.project_selector} style={{width: "40rem", height: "40rem"}}>
            <LoadingIcon/>
        </div>
    }*/


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