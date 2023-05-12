"use client"

import { MutableRefObject, Suspense, useEffect, useRef, useState } from "react"
import styles from "../../styles/UserProfile.module.css"
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase_init";

import Image from "next/image"
import { UserInfo, readUserInfoFromData } from "../global";
import React from "react";
import dynamic from "next/dynamic";
import UserProfileWindow, { DefaultProfileImage } from "./UserProfileWindow";
import { doc, onSnapshot } from "firebase/firestore";




export default function UserProfile() {

    const [userData, setUserData] = useState(null as UserInfo);
    const [user, setUser] = useState(null as User);
    //const [userPromise, setUserPromise] = useState(null as Promise<void>);
    const [showingWindow, setShowingWindow] = useState(false);

    const snapshot_unsub = useRef(null as () => void);

    useEffect(() => {
        return onAuthStateChanged(auth, newUser => {
            if (snapshot_unsub.current) {
                snapshot_unsub.current();
                snapshot_unsub.current = null;
            }

            setUserData(null);
            if (newUser?.uid) {
                snapshot_unsub.current = onSnapshot(doc(db, "users",newUser.uid),snapshot => {
                    setUserData(readUserInfoFromData(snapshot));
                });
            }
            setUser(newUser);
        });
    },[]);

    useEffect(() => {
        return () => {
            if (snapshot_unsub.current) {
                snapshot_unsub.current();
            }
        }
    },[]);

    /*if (userPromise) {
        throw userPromise;
    }*/

    
    if (userData == null) {
        return <></>
    }
    else {
        return <div className={styles.main_icon_area}>
            <Image onClick={() => setShowingWindow(true)} alt="Profile Photo" width={100} height={100} src={userData.profile_picture ?? DefaultProfileImage}></Image>
            {showingWindow ? <UserProfileWindow onClose={() => setShowingWindow(false)} user={user} userInfo={userData}></UserProfileWindow> : <></>}
        </div>
    }
}