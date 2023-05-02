"use client"

import { MutableRefObject, Suspense, useEffect, useRef, useState } from "react"
import styles from "../../styles/UserProfile.module.css"
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase_init";

import Image from "next/image"
import { UserInfo, readUserInfoFromData } from "../global";
import React from "react";
import dynamic from "next/dynamic";
import UserProfileWindow from "./UserProfileWindow";
import { doc, onSnapshot } from "firebase/firestore";




export default function UserProfile() {

    const [userData, setUserData] = useState(null as UserInfo);
    //const [userPromise, setUserPromise] = useState(null as Promise<void>);
    const [showingWindow, setShowingWindow] = useState(false);

    const snapshot_unsub = useRef(null as () => void);

    useEffect(() => {
        return onAuthStateChanged(auth, newUser => {
            if (snapshot_unsub.current) {
                snapshot_unsub.current();
                snapshot_unsub.current = null;
            }

            if (newUser?.uid) {
                snapshot_unsub.current = onSnapshot(doc(db, "users",newUser.uid),snapshot => {
                    setUserData(readUserInfoFromData(snapshot));
                });
            }
            else {
                setUserData(null);
            }
        });

        /*async function downloadUserInfo(userID: string) {
            const newUserData = await userDownloader.get(userID);
            setUserData(newUserData);
            setUserPromise(null);
        }
        const authUnsub = onAuthStateChanged(auth ,newUser => {
            setUserPromise(downloadUserInfo(newUser?.uid));
        });

        const cacheUnsub = userDownloader.addCacheUpdateHook((id: string, value: UserInfo) => {

        });

        return () => {
            authUnsub();
            cacheUnsub();
        }*/
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
            <Image onClick={() => setShowingWindow(true)} alt="Profile Photo" width={100} height={100} src={userData.profile_picture}></Image>
            {showingWindow ? <UserProfileWindow onClose={() => setShowingWindow(false)} userID={userData.id}></UserProfileWindow> : <></>}
        </div>
    }
}