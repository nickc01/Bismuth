import { Project } from "../global";
import { DisplayWindow } from "./DisplayWindow";



export interface OpenProjectWindowProps {
    project: Project,
    onClose?: () => void,
    onOpen?: () => void
}

export default function OpenProjectWindow({project, onClose: onCancel, onOpen} : OpenProjectWindowProps) {
    return <DisplayWindow onClose={onCancel} title={project.name}></DisplayWindow>
}