
import { useEffect, useState } from "react"
import styles from "../../styles/UserProfile.module.css"
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase_init";

import Image from "next/image"


export default function UserProfile() {

    const [user, setUser] = useState(null as User);

    useEffect(() => {
        onAuthStateChanged(auth ,newUser => {
            console.log(newUser);
            setUser(newUser);
        });
    },[]);

    return <div className={styles.main_icon_area}>
        <Image alt="Profile Photo" width={100} height={100} src={user?.photoURL}></Image>
    </div>
}