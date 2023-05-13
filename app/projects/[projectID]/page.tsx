"use client"
import styles from "../../../styles/LoadedProjectPage.module.css";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Task, { GoalInfo, TaskInfo } from "../../../src/components/Task";
import ExpandableArea from "../../../src/components/ExpandableArea";
import LoadingIcon from "../../../src/components/LoadingIcon";
import { Timestamp, addDoc, arrayRemove, arrayUnion, collection, collectionGroup, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { auth, db, onFirebaseInit } from "../../../firebase/firebase_init";
import { useRouter } from "next/navigation";
import WireConnectionContext, { WireConnectionContextData } from "../../../src/WireConnectionContext";
import GuideArea from "../../../src/components/GuideArea";
import { getGoalFromDoc, getTaskFromDoc } from "../../../src/global";
import ZoomBasedDiv from "../../../src/components/ZoomBasedDiv";


//const ENABLE_FIREBASE = true;

function ShallowCopyArray<T>(array: T[]) {
    let newArray: T[] = [];
    for (let i = 0; i < array.length; i++) {
        newArray.push(array[i]);
    }
    return newArray;
}

function UpdateItemInArrayPred<T>(source: T[], predicate: (obj: T) => boolean, modifier: (newObj: T) => void) {
    let index = source.findIndex(predicate);
    if (index >= 0) {
        let newArray = ShallowCopyArray(source);
        const newObj = { ...newArray[index] };
        modifier(newObj);
        newArray[index] = newObj;
        return newArray;
    }
    return source;
}

function RemoveFromArrayPred<T>(source: T[], predicate: (obj: T) => boolean) {
    let newArray: T[] = [];
    for (let i = 0; i < source.length; i++) {
        if (!predicate(source[i])) {
            newArray.push(source[i]);
        }
    }
    return newArray;
}

function AddToArray<T>(source: T[], obj: T) {
    let newArray = ShallowCopyArray(source);
    newArray.push(obj);
    return newArray;
}



function generateDemoGoals(projectID: string): GoalInfo[] {
    return [
        {
            checked: false,
            name: "Test Goal 1",
            timestamp: Timestamp.fromMillis(Date.now() - 3000),
            task_id: "ID_1",
            project_id: projectID,
            owner_id: auth.currentUser.uid,
            goal_id: "GOAL_1"
        },
        {
            checked: true,
            name: "Test Goal 2",
            timestamp: Timestamp.fromMillis(Date.now() - 2000),
            task_id: "ID_1",
            project_id: projectID,
            owner_id: auth.currentUser.uid,
            goal_id: "GOAL_2"
        },
        {
            checked: false,
            name: "Test Goal 3",
            timestamp: Timestamp.fromMillis(Date.now() - 1000),
            task_id: "ID_1",
            project_id: projectID,
            owner_id: auth.currentUser.uid,
            goal_id: "GOAL_3"
        },
        {
            checked: true,
            name: "2 Test Goal 1",
            timestamp: Timestamp.fromMillis(Date.now() - 2000),
            task_id: "ID_2",
            project_id: projectID,
            owner_id: auth.currentUser.uid,
            goal_id: "GOAL_4"
        },
        {
            checked: true,
            name: "2 Test Goal 2",
            timestamp: Timestamp.fromMillis(Date.now() - 3000),
            task_id: "ID_2",
            project_id: projectID,
            owner_id: auth.currentUser.uid,
            goal_id: "GOAL_5"
        }
    ];
}

function generateDemoTasks(projectID: string): TaskInfo[] {
    return [
        {
            width: 300, height: 600, name: "Test1", description: "Test1 Description", project_id: projectID, x: 400, y: 400, task_id: "ID_1", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test2", description: "Test2 Descriptiond df sd f ", project_id: projectID, x: -400, y: -400, task_id: "ID_2", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test3", description: "Test3 Description", project_id: projectID, x: 0, y: 0, task_id: "ID_3", dependsOn: []
        }
    ];
}

export default function LoadedProjectPage({ params }) {
    let [loaded, setLoaded] = useState(false);
    let router = useRouter();

    const [wireMode, setWireMode] = useState(false);

    const [tasks, setTasks] = useState(null as TaskInfo[]);
    const [goals, setGoals] = useState(null as GoalInfo[]);
    const wireContext = useRef(new WireConnectionContextData());

    const moveTask = useCallback((x: number, y: number, task: TaskInfo) => {
        updateDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id), {
            x: x,
            y: y
        }).catch(error => {
            console.error(error);
        });
    }, []);

    const resizeTask = useCallback((width: number, height: number, task: TaskInfo) => {
        updateDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id), {
            width: width,
            height: height
        }).catch(error => {
            console.error(error);
        });
    }, []);

    const updateTaskName = useCallback((name: string, task: TaskInfo) => {
        updateDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id), {
            task_name: name
        }).catch(error => {
            console.error(error);
        });
    }, []);

    const updateTaskDesc = useCallback((desc: string, task: TaskInfo) => {
        updateDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id), {
            description: desc
        }).catch(error => {
            console.error(error);
        });
    }, []);

    const updateGoalName = useCallback((name: string, goal: GoalInfo) => {
        updateDoc(doc(db, "projects", goal.project_id, "project_tasks", goal.task_id, "goals", goal.goal_id), {
            name: name
        }).catch(error => {
            console.error(error);
        });
    }, []);

    const updateGoalChecked = useCallback((checked: boolean, goal: GoalInfo) => {
        updateDoc(doc(db, "projects", goal.project_id, "project_tasks", goal.task_id, "goals", goal.goal_id), {
            checked: checked
        }).catch(error => {
            console.error(error);
        });
    }, []);

    const deleteTask = useCallback((task: TaskInfo) => {
        deleteDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id)).catch(error => {
            console.error(error);
        });
    }, []);

    const deleteGoal = useCallback((goal: GoalInfo) => {
        deleteDoc(doc(db, "projects", goal.project_id, "project_tasks", goal.task_id, "goals", goal.goal_id)).catch(error => {
            console.error(error);
        });
    }, []);

    const createGoal = useCallback((name: string, checked: boolean, task: TaskInfo) => {
        addDoc(collection(db, "projects", task.project_id, "project_tasks", task.task_id, "goals"), {
            name: name,
            checked: checked,
            project_id: task.project_id,
            task_id: task.task_id,
            timestamp: serverTimestamp(),
            owner_id: auth.currentUser.uid
        }).catch(error => {
            console.error(error);
        });
    }, []);

    const changeWireMode = useCallback(() => {
        setWireMode(prev => !prev);
    }, []);

    const createTask = useCallback((name: string = null, description: string = null, project_id: string = params.projectID, x: number = 0, y: number = 0, width: number = 400, height: number = 600, dependsOn: string[] = []) => {
        addDoc(collection(db, "projects", project_id, "project_tasks"), {
            name: name ?? "Untitled Task 123",
            description: description ?? "Insert Description Here",
            project_id: project_id,
            x: x,
            y: y,
            width: width,
            height: height,
            dependsOn: []
        }).catch(error => {
            console.error(error);
        });
    }, [params.projectID]);

    const addTaskDependency = useCallback((source: TaskInfo, dependency: TaskInfo) => {
        updateDoc(doc(db, "projects", source.project_id, "project_tasks", source.task_id), {
            dependsOn: arrayUnion(dependency.task_id)
        }).catch(error => {
            console.error(error);
        });
    }, []);


    const removeTaskDependencies = useCallback((source: TaskInfo, dependencies: string[]) => {
        updateDoc(doc(db, "projects", source.project_id, "project_tasks", source.task_id), {
            dependsOn: arrayRemove(...dependencies)
        }).catch(error => {
            console.error(error);
        });
    }, []);

    useEffect(() => {

        let taskUnsub = null;
        let goalUnsub = null;
        onFirebaseInit(user => {
            if (!user?.uid) {
                router.push("/projects");
            }
            else {
                setLoaded(true);
            }

            taskUnsub = onSnapshot(collection(db, "projects", params.projectID, "project_tasks"), result => {
                setTasks(result.docs.map(d => getTaskFromDoc(params.projectID, d)));
            }, error => {
                console.error("Failed snapshot for projects");
                console.error(error);
                router.push("/");
            });

            goalUnsub = onSnapshot(query(collectionGroup(db, "goals"), where("owner_id", "==", user.uid), where("project_id", "==", params.projectID)), result => {
                setGoals(result.docs.map(d => getGoalFromDoc(d)));
            }, error => {
                console.error("Failed snapshot for goals");
                console.error(error);
            });
        });

        return () => {
            if (taskUnsub) {
                taskUnsub();
            }

            if (goalUnsub) {
                goalUnsub();
            }
        }
    }, [params.projectID, router]);

    const taskGoals = useMemo(() => {
        if (!tasks || !goals) {
            return null;
        }
        return tasks.map(t => goals.filter(g => g.task_id === t.task_id));
    }, [tasks, goals]);
    const completedTasks = useMemo(() => {
        if (!tasks || !goals) {
            return;
        }
        return tasks.map((_, i) => taskGoals[i].every(g => g.checked));
    }, [tasks, goals, taskGoals]);

    const dependenciesAsTasks = useMemo(() => {
        if (!tasks || !goals) {
            return;
        }

        return tasks.map(t => t.dependsOn.map(dependency => tasks.find(t => t.task_id === dependency)));
    },[tasks, goals]);

    const dependenciesCompleted = useMemo(() => {
        if (!tasks || !goals) {
            return;
        }
        return tasks.map(task => {
            return task.dependsOn.map(dependency => completedTasks[tasks.findIndex(t => t.task_id === dependency)]);
        });

    }, [tasks, goals, completedTasks]);

    const taskJSX = useMemo(() => {
        if (!tasks) {
            return <></>
        }
        return tasks.map((t, i) => <Task
            showWires={wireMode}
            dependentTasks={dependenciesAsTasks[i]}
            dependenciesCompleted={dependenciesCompleted[i]}
            goals={taskGoals[i].sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)}
            onGoalNameUpdate={updateGoalName}
            onGoalCheckUpdate={updateGoalChecked}
            onTaskMove={moveTask}
            onTaskDelete={deleteTask}
            onTaskResize={resizeTask}
            onCreateGoal={createGoal}
            onDescUpdate={updateTaskDesc}
            onNameUpdate={updateTaskName}
            onDeleteGoal={deleteGoal}
            addTaskDependency={addTaskDependency}
            removeTaskDependencies={removeTaskDependencies}
            key={t.task_id}
            taskInfo={t} ></Task>)
    }, [tasks,
        wireMode,
        updateGoalName,
        updateGoalChecked,
        moveTask,
        deleteTask,
        resizeTask,
        createGoal,
        updateTaskDesc,
        updateTaskName,
        deleteGoal,
        addTaskDependency,
        dependenciesAsTasks,
        dependenciesCompleted,
        removeTaskDependencies,
        taskGoals]);

    const exitButton = useCallback(() => {
        router.push("/projects");
    }, [router]);

    if (!tasks || !goals || !loaded) {
        return <div style={{ width: "100%", height: "100vh" }}>
            <LoadingIcon/>
        </div>
    }

    return <>
        <ExpandableArea zoomable={true} id="task_area">
            <WireConnectionContext.Provider value={wireContext.current}>
                {taskJSX}
                </WireConnectionContext.Provider>
        </ExpandableArea>
        <ZoomBasedDiv extraTransforms={"translateX(-50%)"} transformOrigin="50% 100%" mainClass={styles.button_controls}>
            {!wireMode && <button onClick={() => createTask()}>Create Task</button>}
            {!wireMode && <button onClick={changeWireMode}>Enable Wire Mode</button>}
            {wireMode && <button onClick={changeWireMode}>Disable Wire Mode</button>}
            <button onClick={exitButton}>Exit</button>
        </ZoomBasedDiv>
        <GuideArea />
    </>
}