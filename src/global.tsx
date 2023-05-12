import { DocumentData, DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import localFont from 'next/font/local'
import { GoalInfo, TaskInfo } from './components/Task';

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

export function getGoalFromDoc(doc: QueryDocumentSnapshot): GoalInfo {
    return {
        name: doc.get("name") ?? "Untitled Goal",
        checked: doc.get("checked") ?? false,
        task_id: doc.get("task_id") ?? null,
        timestamp: doc.get("timestamp") ?? 0,
        goal_id: doc.id,
        project_id: doc.get("project_id") ?? null,
        owner_id: doc.get("owner_id") ?? null
    }
}

export const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max);
};

export interface OffsetResult {
    offsetLeft: number,
    offsetTop: number
}

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