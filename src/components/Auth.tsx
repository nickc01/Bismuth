import { signInWithPopup, signOut } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { auth, googleProvider, onFirebaseInit } from "../../firebase/firebase_init";
import Image from "next/image";

import loading from "../../public/loading.svg"


enum AuthState {
    Uninitialized,
    NotLoggedIn,
    LoggingIn,
    LoggedIn,
    LoggingOut
}


export default function Auth({ onLogin, onStateChange }: { onLogin: () => void, onStateChange: (authState: AuthState) => void }) {
    const [authState, setAuthStatePre] = useState(AuthState.Uninitialized);

    let setAuthState = useCallback((state: AuthState) => {
        if (state !== authState && onStateChange != null) {
            onStateChange(state);
        }
        setAuthStatePre(state);
    }, []);

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
    });

    const signInWithGoogle = async () => {
        setAuthState(AuthState.LoggingIn);
        try {
            await signInWithPopup(auth, googleProvider);
            setAuthState(AuthState.LoggedIn);
        }
        catch (error) {
            console.error(error);
            setAuthState(AuthState.NotLoggedIn);
        }

    };

    const logOut = async () => {
        let previous = authState;
        try {
            setAuthState(AuthState.LoggingOut);
            await signOut(auth);
            setAuthState(AuthState.NotLoggedIn);
        }
        catch (error) {
            console.error(error);
            setAuthState(previous);
        }
    };

    let contentJSX : JSX.Element;

    switch (authState) {
        case AuthState.NotLoggedIn:
            contentJSX = <>
                            <button onClick={signInWithGoogle}>Sign in with google</button>
                         </>;
            break;
        case AuthState.LoggedIn:
            contentJSX = <>
                            <button onClick={logOut}>Sign out</button>
                         </>;
            break;
        default:
            contentJSX = <div className="loading-icon">
                <Image src={loading} height={100} width={100} alt="Loading Icon"></Image>
                <style jsx>{`
                    .loading-icon {
                        margin: auto;
                        color: red;
                    }
                `}</style>
            </div>
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