"use client"

import { signOut } from "firebase/auth";
import ProjectSelector from "../../src/components/ProjectSelector";
import { Project, coolvetica } from "../../src/global";

import styles from "../../styles/Projects.module.css"
import { auth, db } from "../../firebase/firebase_init";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ProjectCreationWindow from "../../src/components/ProjectCreationWindow";
import OpenProjectWindow from "../../src/components/OpenProjectWindow";
import { deleteDoc, doc } from "firebase/firestore";




export default function ProjectsPage() {

    let [creating, setCreating] = useState(false);
    let [selectedProject, setSelectedProject] = useState(null as Project);

    let router = useRouter();

    const startCreatingProject = useCallback(() => {
        if (!creating) {
            setCreating(true);
        }
    },[creating]);

    const logout = useCallback(async () => {
        await signOut(auth);
        router.push("/");
    },[]);

    const openProject = useCallback(async () => {
        //TODO TODO TODO
        //setLoadedProject(selectedProject);
        router.push(`/projects/${selectedProject.id}`);
    }, [selectedProject]);

    const onDeleteProject = useCallback(async () => {
        console.log("Deleting!");
        try {
            if (selectedProject) {
                setSelectedProject(null);
                await deleteDoc(doc(db, "projects", selectedProject.id));
            }
        }
        catch (error) {
            console.error(error);
        }
    }, [selectedProject]);

    let windowJSX: JSX.Element;

    if (selectedProject != null) {
        const onClose = async () => setSelectedProject(null);
        windowJSX = <OpenProjectWindow onOpen={openProject} onCancel={onClose} project={selectedProject} onDelete={onDeleteProject} ></OpenProjectWindow>
    }
    else if (creating) {
        const onClose = () => setCreating(false);
        windowJSX = <ProjectCreationWindow onCreate={onClose} onCancel={onClose}/>
    }
    else {
        windowJSX = <></>
    }

    return (
    <>
        {windowJSX}
        <div className={`${styles.project_page_container} ${selectedProject != null || creating ? styles.scroll_lock : ""}`}>
            <h1 className={`${coolvetica.className} ${styles.logo}`}>Bismuth</h1>
            <div className={`${styles.project_selector_flex}`}>
                <ProjectSelector onProjectSelect={setSelectedProject} />
                <div id={styles.bottom_row}>
                    <button tabIndex={-1} className={styles.logout_button} onClick={logout}>Logout</button>
                    <button tabIndex={-1} className={styles.create_button} onClick={startCreatingProject}>Create Project</button>
                </div>
            </div>
        </div>
    </>);

}