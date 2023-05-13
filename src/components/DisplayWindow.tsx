import CloseButton from "./CloseButton";
import styles from "../../styles/DisplayWindow.module.css";
import { ReactNode, useCallback, useRef } from "react";

// Define the props for the DisplayWindow component
export interface DisplayWindowProps {
    title: string | JSX.Element,
    onClose?: () => void,
    children?: ReactNode,
    zIndex?: number
}

// Define the DisplayWindow component
export function DisplayWindow({ title, onClose, children, zIndex }: DisplayWindowProps) {
    const backgroundRef = useRef();

    // Callback function to handle closing the window on background click
    const closeBackgroundClick = useCallback(e => {
        if (e.target === backgroundRef.current) {
            onClose?.();
        }
    }, [onClose]);

    // Callback function to handle closing the window on button click
    const closeOnClick = useCallback(() => {
        onClose?.();
    }, [onClose]);

    return (
        <div ref={backgroundRef} className={styles.creation_window} onClick={closeBackgroundClick} style={{ zIndex: zIndex }}>
            <div className={styles.inner_window}>
                <div className={styles.header}>
                    <h1 className={`${styles.title}`}>{title}</h1>
                    {onClose != null ? <CloseButton onClose={closeOnClick} /> : <></>}
                </div>
                <div className={styles.children_container}>
                    {children}
                </div>
            </div>
        </div>
    );
}
