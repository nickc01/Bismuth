import { DocumentData, DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import localFont from 'next/font/local';
import { GoalInfo, TaskInfo } from './components/Task';

// Define a local font called 'coolvetica' using the next/font/local package
export const coolvetica = localFont({ src: "../public/coolvetica.woff2" });

// Define the interface for a Project object
export interface Project {
    id?: string;
    name: string;
    description: string;
    owner_id: string;
    editor_ids: string[];
}

// Define the interface for a UserInfo object
export interface UserInfo {
    id?: string;
    display_name: string;
    profile_picture: string;
}

// Function to read project data from a DocumentSnapshot
export function readProjectFromData(doc: DocumentSnapshot<DocumentData>): Project {
    return {
        id: doc.id,
        name: doc.get("name") ?? "Untitled Project",
        description: doc.get("description") ?? "No Description Specified",
        owner_id: doc.get("owner_id") ?? null,
        editor_ids: doc.get("editor_ids") ?? []
    };
}

// Function to read user info data from a DocumentSnapshot
export function readUserInfoFromData(doc: DocumentSnapshot<DocumentData>): UserInfo {
    return {
        id: doc.id,
        display_name: doc.get("display_name") ?? null,
        profile_picture: doc.get("profile_picture") ?? null
    };
}

// Function to get a TaskInfo object from a QueryDocumentSnapshot
export function getTaskFromDoc(projectID: string, doc: QueryDocumentSnapshot): TaskInfo {
    return {
        name: doc.get("task_name") ?? "Untitled Task",
        description: doc.get("description") ?? "No Description",
        task_id: doc.id,
        width: doc.get("width") ?? 300,
        height: doc.get("height") ?? 600,
        x: doc.get("x") ?? 0,
        y: doc.get("y") ?? 0,
        project_id: projectID,
        dependsOn: doc.get("dependsOn") ?? []
    };
}

// Function to get a GoalInfo object from a QueryDocumentSnapshot
export function getGoalFromDoc(doc: QueryDocumentSnapshot): GoalInfo {
    return {
        name: doc.get("name") ?? "Untitled Goal",
        checked: doc.get("checked") ?? false,
        task_id: doc.get("task_id") ?? null,
        timestamp: doc.get("timestamp") ?? 0,
        goal_id: doc.id,
        project_id: doc.get("project_id") ?? null,
        owner_id: doc.get("owner_id") ?? null
    };
}

// Function to clamp a number between a minimum and maximum value
export const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max);
};

// Object to store scroll lock data
let scrollLocks = {};

// Function to begin locking scrollbars
export function BeginLockScrollbars() {
    const id = crypto.randomUUID();

    const oldX = window.scrollX;
    const oldY = window.scrollY;

    let lockOBJ = {
        locked: true,
        onScroll: () => {
            window.scrollTo(oldX, oldY);
        }
    };

    scrollLocks[id] = lockOBJ;

    let update: () => void = null;

    update = () => {
        window.scrollTo(oldX, oldY);
        if (lockOBJ.locked) {
            requestAnimationFrame(update);
        }
    };

    requestAnimationFrame(update);

    window.addEventListener("scroll", lockOBJ.onScroll);
    return id;
}

// Function to stop locking scrollbars
export function EndLockScrollbars(id: string) {
    if (id && id in scrollLocks) {
        const lockOBJ = scrollLocks[id];
        lockOBJ.locked = false;
        window.removeEventListener("scroll", lockOBJ.onScroll);
        delete scrollLocks[id];
    }
}

export interface OffsetResult {
    offsetLeft: number,
    offsetTop: number
}

//Function to get an element's offset relative to a parent
export function getOffsetRelativeTo(sourceElement: HTMLElement, relativeParent: HTMLElement): OffsetResult {

    let offsetLeft = 0;
    let offsetTop = 0;
    

    while (true) {

        offsetLeft += sourceElement.offsetLeft;
        offsetTop += sourceElement.offsetTop;

        sourceElement = sourceElement.parentElement;
        if (!sourceElement || sourceElement === relativeParent) {
            break;
        }
    }

    return {
        offsetLeft: offsetLeft,
        offsetTop: offsetTop
    }
}