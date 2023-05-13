"use client";
import styles from "../../styles/ErrorBoxDisplay.module.css";
import { createContext, useContext, useMemo, useState } from "react";
import CloseButton from "./CloseButton";


export interface ErrorBoxDisplayProps {
    children: any
}

export interface ErrorContextData {
    displayError: (title: string, desc: string) => void
    displayWarning: (title: string, desc: string) => void
    displayInfo: (title: string, desc: string) => void
}

interface DisplayInfo {
    title: string,
    description: string,
    color: string
}

export const ErrorContext = createContext(null as ErrorContextData);

export function useError() {
    return useContext(ErrorContext);
}


export default function ErrorBoxDisplay({ children }: ErrorBoxDisplayProps) {

    const [displayedInfo, setDisplayedInfo] = useState(null as DisplayInfo);


    const errorContextValue: ErrorContextData = useMemo(() => {
        return {
            displayError: (title, desc) => {
                setDisplayedInfo({
                    title: title,
                    description: desc,
                    color: "red"
                });
            },
            displayWarning: (title, desc) => {
                setDisplayedInfo({
                    title: title,
                    description: desc,
                    color: "yellow"
                });
            },
            displayInfo: (title, desc) => {
                setDisplayedInfo({
                    title: title,
                    description: desc,
                    color: "green"
                });
            }
        };
    },[]);


    return <>
        <ErrorContext.Provider value={errorContextValue}>
            {children}
        </ErrorContext.Provider>
        <div className={styles.error_display_container} style={{ display: displayedInfo ? "block" : "none" }}>
            {displayedInfo && <div className={styles.error_display}>
                <div className={styles.close_button_container}>
                    <CloseButton width="3rem" height="3rem" borderRadius="0.5rem" backgroundColor={displayedInfo.color} onClose={() => setDisplayedInfo(null)} />
                </div>
                <h1>{displayedInfo.title}</h1>
                <p>{displayedInfo.description}</p>
            </div>}
        </div>
    </>
}