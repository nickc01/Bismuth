"use client"

import { signInWithPopup } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { auth, googleProvider, onFirebaseInit } from "../../firebase/firebase_init";
import LoadingIcon from "./LoadingIcon";

import styles from "../../styles/Auth.module.css"
import { useError } from "./ErrorBoxDisplay";

enum AuthState {
    Uninitialized,
    NotLoggedIn,
    LoggingIn,
    LoggedIn,
    LoggingOut
}

export interface AuthProps {
    onLogin: () => void
}


export default function Auth({ onLogin }: AuthProps) {
    const [authState, setAuthState] = useState(AuthState.Uninitialized);

    const errorDisplay = useError();

    useEffect(() => {
        onFirebaseInit(user => {
            if (user != null) {
                onLogin?.();
                setAuthState(AuthState.LoggedIn);
            }
            else {
                setAuthState(AuthState.NotLoggedIn);
            }
        });
    }, [onLogin]);

    const signInWithGoogle = useCallback(() => {
        setAuthState(AuthState.LoggingIn);
        signInWithPopup(auth,googleProvider).then(result => {
            setAuthState(AuthState.LoggedIn);
            onLogin?.();
        }).catch(error => {
            errorDisplay.displayError("Couldn't login", error);
            console.error(error);
            setAuthState(AuthState.NotLoggedIn);
        });
    }, [onLogin, errorDisplay]);

    let contentJSX : JSX.Element;

    switch (authState) {
        case AuthState.NotLoggedIn:
            contentJSX = <button onClick={signInWithGoogle}>Sign in With Google</button>;
            break;
        default:
            contentJSX = <LoadingIcon/>
            break;
    }

    return (
        <div className={styles.auth_container}>
            {contentJSX}
        </div>
    );
}