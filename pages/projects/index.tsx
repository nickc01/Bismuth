import { signOut } from "firebase/auth";
import ProjectSelector from "../../src/components/ProjectSelector";
import { Project, coolvetica, setLoadedProject } from "../../src/global";

import styles from "../../styles/Projects.module.css"
import { auth } from "../../firebase/firebase_init";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import ProjectCreationWindow from "../../src/components/ProjectCreationWindow";
import OpenProjectWindow from "../../src/components/OpenProjectWindow";




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
        setLoadedProject(selectedProject);
        router.push(`/projects/${selectedProject.id}`);
    },[selectedProject]);

    let windowJSX: JSX.Element;

    if (selectedProject != null) {
        const onClose = async () => setSelectedProject(null);
        windowJSX = <OpenProjectWindow onOpen={openProject} onClose={onClose} project={selectedProject} ></OpenProjectWindow>
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