import CloseButton from "./CloseButton";
import styles from "../../styles/DisplayWindow.module.css"
import { ReactNode, useCallback, useRef } from "react";


export interface DisplayWindowProps {
    title: string,
    onClose?: () => void,
    children?: ReactNode
}

export function DisplayWindow({title, onClose, children}: DisplayWindowProps) {
    const backgroundRef = useRef();

    const closeBackgroundClick = useCallback(e => {
        if (e.target == backgroundRef.current) {
            onClose?.();
        }
    },[onClose]);

    const closeOnClick = useCallback(() => {
        onClose?.();
    },[onClose]);

    return (<div ref={backgroundRef} className={styles.creation_window} onClick={closeBackgroundClick}>
        <div className={styles.inner_window}>
            <div className={styles.header}>
                <h1 className={`${styles.title}`}>{title}</h1>
                {onClose != null ? <CloseButton onClose={closeOnClick}/> : <></>}
            </div>
            {children}
        </div>
    </div>);
}