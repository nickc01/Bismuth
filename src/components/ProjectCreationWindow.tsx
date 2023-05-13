import React, { FormEvent, MutableRefObject, useCallback, useRef, useState } from "react";
import styles from "../../styles/ProjectCreationWindow.module.css"
import LoadingIcon from "./LoadingIcon";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase_init";
import { Project } from "../global";
import { DisplayWindow } from "./DisplayWindow";

export interface ProjectCreationWindowProps {
    onCreate?: () => void,
    onCancel?: () => void
}

export default function ProjectCreationWindow({onCreate, onCancel}: ProjectCreationWindowProps) {

    const nameRef: MutableRefObject<HTMLInputElement> = useRef();
    const descRef: MutableRefObject<HTMLTextAreaElement> = useRef();

    let [creating, setCreating] = useState(false);

    const createProject = useCallback(async (name: string, desc: string) => {
        if (creating) {
            return;
        }
        setCreating(true);

        const newProject : Project = {
            name: name,
            description: desc,
            owner_id: auth.currentUser.uid,
            editor_ids: [
                auth.currentUser.uid
            ]
        };

        addDoc(collection(db,"projects"),newProject).then(result => {
            setCreating(false);
            console.log("Project Created Successfully!");
            onCreate();
        }).catch(error => {
            console.error(error);
            setCreating(false);
        })
    },[creating, onCreate]);

    const closeWindow = useCallback(() => {
        onCancel?.();
    },[onCancel]);

    const onSubmitProjectInfo = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = nameRef.current.value;
        const desc = descRef.current.value;
        createProject(name, desc);
        return false;
    }, [createProject]);

    let contentJSX;

    if (creating) {
        contentJSX = <DisplayWindow title="Creating Project...">
            <LoadingIcon/>
        </DisplayWindow>
    }
    else {
        contentJSX = <DisplayWindow zIndex={3000} onClose={closeWindow} title={"Create New Project"}>
            <form onSubmit={e => {return onSubmitProjectInfo(e)}} className={styles.project_form}>
                    <label>Name</label>
                    <input ref={nameRef as any} id="p_name" name="p_name" placeholder="Name..." required/>
                    <label >Description</label>
                    <textarea ref={descRef as any} id="p_desc" name="p_desc" placeholder="Description..." required/>
                    <div className={styles.spacer}></div>
                    <input className={styles.submit_button} type="submit" value="Create" />
                </form> 
        </DisplayWindow>
    }

    return contentJSX;
}