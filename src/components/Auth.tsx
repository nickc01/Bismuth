import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { auth, googleProvider, onFirebaseInit } from "../../firebase/firebase_init";
import LoadingIcon from "./LoadingIcon";




let message = "Sign in With Google";

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

    useEffect(() => {
        onFirebaseInit(user => {
            if (user != null) {
                if (onLogin != null) {
                    onLogin();
                }
                setAuthState(AuthState.LoggedIn);
            }
            else {
                setAuthState(AuthState.NotLoggedIn);
            }
        });
    },[]);

    const signInWithGoogle = useCallback(() => {
        setAuthState(AuthState.LoggingIn);
        signInWithPopup(auth,googleProvider).then(result => {
            setAuthState(AuthState.LoggedIn);
        }).catch(error => {
            console.error(error);
            setAuthState(AuthState.NotLoggedIn);
        });
    },[]);

    let contentJSX : JSX.Element;

    switch (authState) {
        case AuthState.NotLoggedIn:
            contentJSX = <button onClick={signInWithGoogle}>{message}</button>;
            break;
        default:
            contentJSX = <LoadingIcon></LoadingIcon>
            break;
    }

    return (
        <div className="auth-container">
            {contentJSX}
            <style jsx>{`
                .auth-container {
                    width: 20rem;
                    height: 10rem;
                    background-color: var(--secondary-color);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    padding: 1rem;
                    row-gap: 0.5rem;
                    border-radius: 1rem;
                }
            `}</style>
        </div>
    );
}