import { collection, collectionGroup, getDocs, onSnapshot, query, where, DocumentChangeType} from "firebase/firestore"
import { db, onFirebaseInit, waitForFirebaseInit } from "../../firebase/firebase_init"
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import { useEffect, useState } from "react";

import styles from "../../styles/ProjectSelector.module.css"
import { useRouter } from "next/router";


export interface Project {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    editor_ids: string[];
}

export default function ProjectSelector({width = "40rem", height = "40rem", onProjectSelect = null}) {

    let router = useRouter();
    let [projects, setProjects] = useState([] as Project[]);

    useEffect(() => {
        onFirebaseInit(user => {
            if (user === null || user.uid === null) {
                router.push("/");
                return;
            }
            let projectsCollectionRef = collection(db,"projects");

            let q = query(projectsCollectionRef,where("owner_id","==", user.uid));
            return onSnapshot(q,data => {
                setProjects(data.docs.map(d => {
                    return {
                            id: d.id, 
                            name: d.get("name"),
                            description: d.get("description"),
                            owner_id: d.get("owner_id"),
                            editor_ids: d.get("editor_ids")
                        };
                }));
            });
        });
    });

    function selectProject(projectID : string) {
        let index = projects.findIndex(p => p.id == projectID);
        if (index >= 0 && onProjectSelect != null) {
            onProjectSelect(projects[index]);
        }
    }



    return <div className={styles.project_selector} style={{width: width, height: height}}>
        <h1>Projects</h1>
        <div className={styles.project_container}>
            {projects.map(p => {
                return (<div className={`${styles.project} unselectable`} onClick={() => selectProject(p.id)} key={p.id}>
                    <h1>{p.name}</h1>
                    <p>{p.description}</p>
                </div>);
            })}
        </div>
    </div>
}

/*export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (context) => {
    
    //const res = await fetch('https://.../data')
    await waitForFirebaseInit();
    let projectsCollectionRef = collection(db,"projects");
    let docData = await getDocs(query(projectsCollectionRef));

    let retrievedProjects : Project[] = [];

    docData.forEach(doc => {
        console.log("DOC ID = " + doc.id);
        console.log("DOC NAME = " + doc.get("name"));
        retrievedProjects.push({id: doc.id, name: doc.get("name")});
    });

    let data = {
        projects: retrievedProjects
    }
  
    return {
      props: {
        data,
      },
    }
  }*/