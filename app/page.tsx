"use client"

import { useRouter } from "next/navigation";
import Auth from "../src/components/Auth";
import { coolvetica } from '../src/global';
import styles from "../styles/HomePage.module.css";


export default function LoginPage() {
  const router = useRouter();
  
  return (
    <div className={styles.login_container}>
        <h1 className={coolvetica.className}>Bismuth</h1>
        <h3>Project Task Tracker</h3>
        <Auth onLogin={() => router.push("/projects")}></Auth>
    </div>
  )
}