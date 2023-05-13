import React, { FormEvent, MutableRefObject, useCallback, useRef, useState } from "react";
import styles from "../../styles/ProjectCreationWindow.module.css";
import LoadingIcon from "./LoadingIcon";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase_init";
import { Project } from "../global";
import { DisplayWindow } from "./DisplayWindow";
import { useError } from "./ErrorBoxDisplay";

// Define the props for the ProjectCreationWindow component
export interface ProjectCreationWindowProps {
    onCreate?: () => void,
    onCancel?: () => void
}

// Define the ProjectCreationWindow component
export default function ProjectCreationWindow({ onCreate, onCancel }: ProjectCreationWindowProps) {
    // Refs for input fields
    const nameRef: MutableRefObject<HTMLInputElement> = useRef();
    const descRef: MutableRefObject<HTMLTextAreaElement> = useRef();

    const errorDisplay = useError();

    // State for tracking the creation process
    let [creating, setCreating] = useState(false);

    // Function to create a project
    const createProject = useCallback(async (name: string, desc: string) => {
        if (creating) {
            return;
        }
        setCreating(true);

        const newProject: Project = {
            name: name,
            description: desc,
            owner_id: auth.currentUser.uid,
            editor_ids: [
                auth.currentUser.uid
            ]
        };

        // Add the project to the Firestore collection
        addDoc(collection(db, "projects"), newProject)
            .then(_ => {
                setCreating(false);
                console.log("Project Created Successfully!");
                onCreate?.(); // Call the onCreate callback if provided
            })
            .catch(error => {
                console.error(error);
                errorDisplay.displayError("Failed to add project", error);
                setCreating(false);
            });
    }, [creating, onCreate]);

    // Function to close the window
    const closeWindow = useCallback(() => {
        onCancel?.(); // Call the onCancel callback if provided
    }, [onCancel]);

    // Function to handle form submission
    const onSubmitProjectInfo = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = nameRef.current.value;
        const desc = descRef.current.value;
        createProject(name, desc);
        return false;
    }, [createProject]);

    let contentJSX;

    if (creating) {
        // Show a loading window while creating the project
        contentJSX = (
            <DisplayWindow title="Creating Project...">
                <LoadingIcon />
            </DisplayWindow>
        );
    } else {
        // Show the project creation form
        contentJSX = (
            <DisplayWindow zIndex={3000} onClose={closeWindow} title={"Create New Project"}>
                <form onSubmit={e => { return onSubmitProjectInfo(e) }} className={styles.project_form}>
                    <label>Name</label>
                    <input ref={nameRef as any} id="p_name" name="p_name" placeholder="Name..." required />
                    <label>Description</label>
                    <textarea ref={descRef as any} id="p_desc" name="p_desc" placeholder="Description..." required />
                    <div className={styles.spacer}></div>
                    <input className={styles.submit_button} type="submit" value="Create" />
                </form>
            </DisplayWindow>
        );
    }

    return contentJSX;
}
