"use client";
import styles from "../../styles/ErrorBoxDisplay.module.css";
import { createContext, useContext, useMemo, useState } from "react";
import CloseButton from "./CloseButton";

// Define the props for the ErrorBoxDisplay component
export interface ErrorBoxDisplayProps {
    children: any
}

// Define the context data for error handling
export interface ErrorContextData {
    displayError: (title: string, desc: string) => void
    displayWarning: (title: string, desc: string) => void
    displayInfo: (title: string, desc: string) => void
}

// Create the context for error handling
export const ErrorContext = createContext(null as ErrorContextData);

// Custom hook for accessing the error context
export function useError() {
    return useContext(ErrorContext);
}

// Define the interface for the displayed error info
interface DisplayInfo {
    title: string,
    description: string,
    color: string
}

// Define the ErrorBoxDisplay component
export default function ErrorBoxDisplay({ children }: ErrorBoxDisplayProps) {
    const [displayedInfo, setDisplayedInfo] = useState(null as DisplayInfo);

    // Create the context value for error handling
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
    }, []);

    return (
        <>
            <ErrorContext.Provider value={errorContextValue}>
                {children}
            </ErrorContext.Provider>
            <div className={styles.error_display_container} style={{ display: displayedInfo ? "block" : "none" }}>
                {displayedInfo && (
                    <div className={styles.error_display}>
                        <div className={styles.close_button_container}>
                            <CloseButton
                                width="3rem"
                                height="3rem"
                                borderRadius="0.5rem"
                                backgroundColor={displayedInfo.color}
                                onClose={() => setDisplayedInfo(null)}
                            />
                        </div>
                        <h1>{displayedInfo.title}</h1>
                        <p>{displayedInfo.description}</p>
                    </div>
                )}
            </div>
        </>
    );
}