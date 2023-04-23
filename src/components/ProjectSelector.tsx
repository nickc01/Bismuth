import { collection, onSnapshot, query, where} from "firebase/firestore"
import { db, onFirebaseInit } from "../../firebase/firebase_init"
import { useCallback, useEffect, useState } from "react";

import styles from "../../styles/ProjectSelector.module.css"
import { useRouter } from "next/router";
import LoadingIcon from "./LoadingIcon";
import { Project } from "../global";

export interface ProjectSelectorProps {
    onProjectSelect?: (project: Project) => void
}

export default function ProjectSelector({onProjectSelect}: ProjectSelectorProps) {

    let [loaded, setLoaded] = useState(false);

    let router = useRouter();
    let [projects, setProjects] = useState([] as Project[]);

    useEffect(() => {
        onFirebaseInit(user => {
            if (user === null || user.uid === null) {
                router.push("/");
                return;
            }
            let projectsCollectionRef = collection(db,"projects");

            let q = query(projectsCollectionRef,where("owner_id","==", user.uid));
            return onSnapshot(q,data => {
                setLoaded(true);
                setProjects(data.docs.map(d => {
                    return {
                            id: d.id, 
                            name: d.get("name") ?? "Untitled Project",
                            description: d.get("description") ?? "No description",
                            owner_id: d.get("owner_id") ?? null,
                            editor_ids: d.get("editor_ids") ?? []
                        };
                }));
            });
        });
    },[]);

    const selectProject = useCallback((projectID: string) => {
        let index = projects.findIndex(p => p.id == projectID);
        if (index >= 0 && onProjectSelect != null) {
            onProjectSelect(projects[index]);
        }
    },[onProjectSelect, projects]);

    if (!loaded) {
        return <div className={styles.project_selector} style={{width: "40rem", height: "40rem"}}>
            <LoadingIcon/>
        </div>
    }


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