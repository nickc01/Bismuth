import { DocumentData, DocumentSnapshot, doc, getDoc, getDocFromCache, getDocsFromCache } from 'firebase/firestore';
import localFont from 'next/font/local'
import { db } from '../firebase/firebase_init';
import { resourceLimits } from 'worker_threads';

export const coolvetica = localFont({src: "../public/coolvetica.woff2"});

export interface Project {
    id?: string;
    name: string;
    description: string;
    owner_id: string;
    editor_ids: string[];
}

export function readProjectFromData(doc: DocumentSnapshot<DocumentData>) : Project {
    return {
        id: doc.id,
        name: doc.get("name") ?? "Untitled Project",
        description: doc.get("description") ?? "No Description Specified",
        owner_id: doc.get("owner_id") ?? null,
        editor_ids: doc.get("editor_ids") ?? []
    };
}

let loadedProject: Project = null;

let projectPromises: ((project: Project) => void)[] = [];


export function getProjectDetails(projectID: string): Promise<Project> {

    if (loadedProject.id == projectID) {
        return Promise.resolve(loadedProject);
    }

    if (projectPromises.length == 0) {
        projectPromises.push(null);
        return getDoc(doc(db,"projects",projectID)).then(doc => {
            loadedProject = readProjectFromData(doc);
            if (projectPromises.length > 0) {
                for (let i = 0; i < projectPromises.length; i++) {
                    projectPromises[i]?.(loadedProject);
                }
            }

            return loadedProject;
        });
    }
    else {
        return new Promise<Project>((resolve, reject) => {
            if (loadedProject.id == projectID) {
                resolve(loadedProject);
            }
            else {
                projectPromises.push(resolve);
            }
        })
    }

    /*try {
        return readProjectFromData(await getDocFromCache(doc(db, "projects", projectID)));
    } catch (error) {
        return readProjectFromData(await getDoc(doc(db, "projects", projectID)));
    }*/
    /*return getDocFromCache(doc(db, "projects", projectID)).then(doc => {
        return readProjectFromData(doc);
    }).catch(error => {

    });*/
    /*if (selectedProject.id == projectID) {
        return Promise.resolve(selectedProject);
    }*/

    /*try {
        if (projectPromises.length == 0) {
            return getDoc(doc(db,"projects",projectID)).then(doc => {
                selectedProject = readProjectFromData(doc);
                if (projectPromises.length > 0) {
                    let promises = projectPromises;
                    projectPromises = [];
                    for (let i = 0; i < promises.length; i++) {
                        //TODO - RESOLVE ALL OTHER PROMISES
                    }
                }

                return selectedProject;
            });
        }
        else {

        }
        //let result = await getDoc(doc(db,"projects",projectID));
        //selectedProject = readProjectFromData(result);
    }
    catch (error) {
        console.error(error);
    }*/
}

export function setLoadedProject(project: Project) {
    loadedProject = project;
}

