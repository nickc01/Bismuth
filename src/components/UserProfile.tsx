"use client"

import { useEffect, useRef, useState } from "react";
import styles from "../../styles/UserProfile.module.css";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase_init";

import Image from "next/image";
import { UserInfo, readUserInfoFromData } from "../global";
import React from "react";
import UserProfileWindow, { DefaultProfileImage } from "./UserProfileWindow";
import { doc, onSnapshot } from "firebase/firestore";
import ZoomBasedDiv from "./ZoomBasedDiv";

// Define the UserProfile component
export default function UserProfile() {
    const [userData, setUserData] = useState(null as UserInfo);
    const [user, setUser] = useState(null as User);
    const [showingWindow, setShowingWindow] = useState(false);

    const snapshot_unsub = useRef(null as () => void);

    // Fetch user data when the authentication state changes
    useEffect(() => {
        return onAuthStateChanged(auth, (newUser) => {
            // Unsubscribe from the previous snapshot
            if (snapshot_unsub.current) {
                snapshot_unsub.current();
                snapshot_unsub.current = null;
            }

            // Reset user data
            setUserData(null);

            if (newUser?.uid) {
                // Subscribe to the user document snapshot
                snapshot_unsub.current = onSnapshot(
                    doc(db, "users", newUser.uid),
                    (snapshot) => {
                        setUserData(readUserInfoFromData(snapshot));
                    }
                );
            }
            setUser(newUser);
        });
    }, []);

    // Unsubscribe from the snapshot on component unmount
    useEffect(() => {
        return () => {
            if (snapshot_unsub.current) {
                snapshot_unsub.current();
            }
        };
    }, []);

    // Render loading state if user data is not available
    if (userData == null) {
        return <></>;
    } else {
        return (
            <>
                <ZoomBasedDiv
                    transformOrigin="100% 0"
                    mainClass={styles.main_icon_area}
                >
                    <Image
                        onClick={() => setShowingWindow(true)}
                        alt="Profile Photo"
                        width={100}
                        height={100}
                        src={userData.profile_picture ?? DefaultProfileImage}
                    />
                </ZoomBasedDiv>
                {showingWindow ? (
                    <UserProfileWindow
                        onClose={() => setShowingWindow(false)}
                        user={user}
                        userInfo={userData}
                    />
                ) : (
                    <></>
                )}
            </>
        );
    }
}
