import { signInWithPopup } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { auth, googleProvider, onFirebaseInit } from "../../firebase/firebase_init";
import LoadingIcon from "./LoadingIcon";

import styles from "../../styles/Auth.module.css";
import { useError } from "./ErrorBoxDisplay";

// Define the authentication states
enum AuthState {
    Uninitialized,
    NotLoggedIn,
    LoggingIn,
    LoggedIn,
    LoggingOut
}

// Define the props for the Auth component
export interface AuthProps {
    onLogin: () => void
}

// Define the Auth component
export default function Auth({ onLogin }: AuthProps) {
    const [authState, setAuthState] = useState(AuthState.Uninitialized);

    // Use the error display hook
    const errorDisplay = useError();

    useEffect(() => {
        // Initialize Firebase and set the authentication state based on the user
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

    // Sign in with Google
    const signInWithGoogle = useCallback(() => {
        setAuthState(AuthState.LoggingIn);
        signInWithPopup(auth, googleProvider)
            .then(result => {
                setAuthState(AuthState.LoggedIn);
                onLogin?.();
            })
            .catch(error => {
                errorDisplay.displayError("Failed to login", error);
                console.error(error);
                setAuthState(AuthState.NotLoggedIn);
            });
    }, [onLogin, errorDisplay]);

    let contentJSX: JSX.Element;

    // Render different content based on the authentication state
    switch (authState) {
        case AuthState.NotLoggedIn:
            contentJSX = <button onClick={signInWithGoogle}>Sign in With Google</button>;
            break;
        default:
            contentJSX = <LoadingIcon />;
            break;
    }

    return (
        <div className={styles.auth_container}>
            {contentJSX}
        </div>
    );
}
