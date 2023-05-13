"use client"

import { signOut } from "firebase/auth";
import ProjectSelector from "../../src/components/ProjectSelector";
import { Project, coolvetica, readProjectFromData } from "../../src/global";

import styles from "../../styles/Projects.module.css"
import { auth, db, onFirebaseInit } from "../../firebase/firebase_init";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ProjectCreationWindow from "../../src/components/ProjectCreationWindow";
import OpenProjectWindow from "../../src/components/OpenProjectWindow";
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import LoadingIcon from "../../src/components/LoadingIcon";
import { useError } from "../../src/components/ErrorBoxDisplay";




export default function ProjectsPage() {

    let [creating, setCreating] = useState(false);
    let [selectedProjectID, setSelectedProjectID] = useState(null as string);
    let [loaded, setLoaded] = useState(false);
    let [projects, setProjects] = useState([] as Project[]);

    const errorDisplay = useError();

    let router = useRouter();

    const startCreatingProject = useCallback(() => {
        setCreating(true);
    },[]);

    const logout = useCallback(async () => {
        await signOut(auth);
        router.push("/");
    },[router]);

    const openProject = useCallback(async () => {
        router.push(`/projects/${selectedProjectID}`);
    }, [router, selectedProjectID]);

    const onDeleteProject = useCallback(async () => {
        try {
            if (selectedProjectID) {
                setSelectedProjectID(null);
                await deleteDoc(doc(db, "projects", selectedProjectID));
            }
        }
        catch (error) {
            errorDisplay.displayError("Failed to delete project", error);
            console.error(error);
        }
    }, [selectedProjectID]);

    const onTitleUpdate = useCallback(newText => {
        if (selectedProjectID) {
            updateDoc(doc(db, "projects", selectedProjectID), {
                name: newText
            });
        }
    }, [selectedProjectID]);

    const onDescUpdate = useCallback(newText => {
        if (selectedProjectID) {
            updateDoc(doc(db, "projects", selectedProjectID), {
                description: newText
            });
        }
    }, [selectedProjectID]);

    let windowJSX: JSX.Element;

    if (selectedProjectID) {
        const onClose = async () => setSelectedProjectID(null);
        windowJSX = <OpenProjectWindow onOpen={openProject} onCancel={onClose} project={projects.find(p => p.id === selectedProjectID)} onDelete={onDeleteProject} onTitleTextChanged={onTitleUpdate} onDescriptionTextChanged={onDescUpdate} ></OpenProjectWindow>
    }
    else if (creating) {
        const onClose = () => setCreating(false);
        windowJSX = <ProjectCreationWindow onCreate={onClose} onCancel={onClose}/>
    }
    else {
        windowJSX = <></>
    }

    useEffect(() => {
        onFirebaseInit(user => {
            if (user === null || user.uid === null) {
                router.push("/");
                return;
            }

            let projectsCollectionRef = collection(db, "projects");

            let q = query(projectsCollectionRef, where("owner_id", "==", user.uid));
            return onSnapshot(q, data => {
                setLoaded(true);
                setProjects(data.docs.map(d => readProjectFromData(d)));
            });
        });
    }, [router]);

    if (!loaded) {
        return <div style={{ width: "100%", height: "95vh" }}>
            <LoadingIcon />;
        </div>
    }

    return (
    <>
        {windowJSX}
        <div className={`${styles.project_page_container} ${selectedProjectID != null || creating ? styles.scroll_lock : ""}`}>
            <h1 className={`${coolvetica.className} ${styles.logo}`}>Bismuth</h1>
                <div className={`${styles.project_selector_flex}`}>
                    <ProjectSelector onProjectSelect={setSelectedProjectID} projects={projects} />
                <div id={styles.bottom_row}>
                    <button tabIndex={-1} className={styles.logout_button} onClick={logout}>Logout</button>
                    <button tabIndex={-1} className={styles.create_button} onClick={startCreatingProject}>Create Project</button>
                </div>
            </div>
        </div>
    </>);

}