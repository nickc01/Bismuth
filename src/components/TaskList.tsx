import { useEffect, useState } from "react";
import { db, onFirebaseInit } from "../../firebase/firebase_init"
import { CollectionReference, DocumentData, addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, DocumentChangeType } from "firebase/firestore";

interface Task {
    name: string,
    id: string,
    completed: boolean
}

let taskCollectionRef : CollectionReference<DocumentData> = null;

async function AddTask(name : string, completed : boolean) {
    return await addDoc(taskCollectionRef,{name: name, completed: completed});
}


async function RemoveTask(id : string) {
    await deleteDoc(doc(taskCollectionRef,id));
}


export default function TaskList() {
    let [tasks, setTasks] = useState(new Array<Task>());

    useEffect(() => {
        onFirebaseInit(user => {
            taskCollectionRef = collection(db, "tasks");
            let dirty = true;
            tasks = [];

            onSnapshot(taskCollectionRef,snapshot => {
                
                console.log("Changed!");
                snapshot.docChanges().forEach(change => {
                    switch (change.type) {
                        case 'added':
                            tasks.push({name: change.doc.get("name"), id: change.doc.id, completed: change.doc.get("completed")});
                            dirty = true;
                            console.log("Added " + change.doc.get("name"));
                            break;
                        case 'removed':
                            tasks.splice(tasks.findIndex(v => v.id == change.doc.id),1);
                            dirty = true;
                            console.log("Removed " + change.doc.get("name"));
                            break;
                        case 'modified':
                            let index = tasks.findIndex(v => v.id == change.doc.id);
                            tasks[index].name = change.doc.get("name");
                            tasks[index].completed = change.doc.get("completed");
                            dirty = true;
                            console.log("Modified " + change.doc.get("name"));
                            break;
                    }
                });

                if (dirty) {
                    tasks.sort((a, b) => {
                        if (a.name > b.name) {
                            return 1;
                        }
                        else if (a.name < b.name) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    });
                    dirty = false;
                    console.log("SET TASKS A");
                    setTasks([...tasks]);
                }
            });

            if (dirty) {
                dirty = false;
                console.log("SET TASKS B");
                setTasks([...tasks]);
            }

        });
    },[]);

    console.log("RERENDER");
    return (
    <div>
        {tasks.map(t => {
            return (<p key={t.id} id={t.id}>{t.name}:{t.completed ? "true" : "false"}</p>);
        })}
    </div>
    );
}