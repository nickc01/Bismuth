import { DocumentData, DocumentSnapshot, doc, getDoc, getDocFromCache, getDocsFromCache } from 'firebase/firestore';
import localFont from 'next/font/local'
import { db } from '../firebase/firebase_init';
import documentCache from './documentCache';

export const coolvetica = localFont({src: "../public/coolvetica.woff2"});

export interface Project {
    id?: string;
    name: string;
    description: string;
    owner_id: string;
    editor_ids: string[];
}

export interface UserInfo {
    id?: string;
    display_name: string;
    profile_picture: string;
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

export function readUserInfoFromData(doc: DocumentSnapshot<DocumentData>) : UserInfo  {
    return {
        id: doc.id,
        display_name: doc.get("display_name") ?? null,
        profile_picture: doc.get("profile_picture")?? null
    }
}

let userDownloader = new documentCache<UserInfo>(id => getDoc(doc(db,"users",id)).then(readUserInfoFromData),50);
let projectDownloader = new documentCache<Project>(id => getDoc(doc(db, "projects", id)).then(readProjectFromData),50);




export async function getProjectDetails(id: string) {
    return await projectDownloader.get(id);
}

export async function getUserDetails(id: string) {
    return await userDownloader.get(id);
}




//let loadedProject: Project = null;

//let projectPromiseResolvers: ((project: Project) => void)[] = [];


/*export function getProjectDetails(projectID: string): Promise<Project> {

    if (loadedProject.id == projectID) {
        return Promise.resolve(loadedProject);
    }

    if (projectPromiseResolvers.length == 0) {
        projectPromiseResolvers.push(null);
        return getDoc(doc(db,"projects",projectID)).then(doc => {
            loadedProject = readProjectFromData(doc);
            if (projectPromiseResolvers.length > 0) {
                for (let i = 0; i < projectPromiseResolvers.length; i++) {
                    projectPromiseResolvers[i]?.(loadedProject);
                }
                projectPromiseResolvers = [];
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
                projectPromiseResolvers.push(resolve);
            }
        })
    }
}*/

//let loadedUsers: UserInfo[] = [];

/*interface user_download {
    promiseResolver: (user: UserInfo) => void,
    userID: string
}*/



/*let userPromises = {};


export function getUserDetails(userID: string): Promise<UserInfo> {

    if (userID in loadedUsers) {
        return Promise.resolve(loadedUsers[userID]);
    }

    //let promiseCount = userPromises.reduce((count, current) => count + (current.userID == userID ? 1 : 0),0);

    if (promiseCount == 0) {
        userPromises.push(null);
        return getDoc(doc(db,"users",userID)).then(doc => {
            let loadedUser = readUserInfoFromData(doc);
            loadedUsers[userID] = loadedUser;
            if (userPromises.length > 0) {
                for (let i = 0; i < userPromises.length; i++) {
                    userPromises[i]?.(loadedUser);
                }
            }

            return loadedUser;
        });
    }
    else {
        return new Promise<UserInfo>((resolve, reject) => {
            if (userID in loadedUsers) {
                resolve(loadedUsers[userID]);
            }
            else {
                userPromises.push(resolve);
            }
        })
    }
}*/

