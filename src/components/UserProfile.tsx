
import { Suspense, useEffect, useState } from "react"
import styles from "../../styles/UserProfile.module.css"
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase_init";

import Image from "next/image"
import { doc, getDoc } from "firebase/firestore/lite";
import { UserInfo, getUserDetails } from "../global";
import LoadingSuspense from "./LoadingSuspense";
import LoadingIcon from "./LoadingIcon";


export default function UserProfile() {

    const [userData, setUserData] = useState(null as UserInfo);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth ,newUser => {
            async function downloadUserInfo(userID: string) {
                setUserData(await getUserDetails(userID));
            }

            downloadUserInfo(newUser?.uid);
        });
    },[]);

    console.log(userData);
    if (userData)
    {
        return <div className={styles.main_icon_area}>
        <Image alt="Profile Photo" width={100} height={100} src={userData.profile_picture}></Image>
        </div>
    }
    else {
        return <></>
    }
}