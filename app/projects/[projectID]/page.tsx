"use client"
import styles from "../../../styles/LoadedProjectPage.module.css";
import gridImage from "../../../public/grid.png";
import { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback, DependencyList, use } from "react";
import Task, { GoalInfo, TaskInfo } from "../../../src/components/Task";
import ExpandableArea from "../../../src/components/ExpandableArea";
import ZoomControls from "../../../src/components/ZoomControls";
import LoadingIcon from "../../../src/components/LoadingIcon";
import { QueryDocumentSnapshot, Timestamp, addDoc, arrayRemove, arrayUnion, collection, collectionGroup, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { auth, db, onFirebaseInit } from "../../../firebase/firebase_init";
import { Server } from "net";
import { useRouter } from "next/navigation";
import WireConnectionContext, { WireConnectionContextData } from "../../../src/WireConnectionContext";


const ENABLE_FIREBASE = true;

let counter = 100;


/*function useCallback(func, dependencies) {
    return func;
}*/

/*const BACKGROUND_PADDING = 750;


function onScroll() {
    console.log("Scroll X = " + document.documentElement.scrollLeft);
    console.log("Scroll Y = " + document.documentElement.scrollTop);
}*/

/*function renderTaskInfo(tasks: TaskInfo[]) {
    for (let i = 0; i < tasks.length; i++) {
        tasks[i].innerHTML = <Task key={t.id} xOffset={bounds.x - BACKGROUND_PADDING} yOffset={bounds.y - BACKGROUND_PADDING} taskInfo={t}></Task>
    }
}*/

function ShallowCopyArray<T>(array: T[]) {
    let newArray: T[] = [];
    for (let i = 0; i < array.length; i++) {
        newArray.push(array[i]);
    }
    return newArray;
}

/*function UpdateArrayObject<T>(source: T[], obj: T, updater: (newObj: T) => void) {
    let index = source.indexOf(obj);
    if (index >= 0) {
        const newObj = {...obj};
        updater(newObj);
        source[index] = newObj;
    }
}*/

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

/*function UpdateItemInArray<T>(source: T[], obj: T, modifier: (newObj: T) => void) {
    let index = source.indexOf(obj);
    if (index >= 0) {
        let newArray = ShallowCopyArray(source);
        const newObj = structuredClone(obj);
        modifier(newObj);
        newArray[index] = newObj;
        return newArray;
    }
    return source;
}*/

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
        }/*,
        {
            width: 300, height: 600, name: "Test1", description: "Test1 Description", project_id: projectID, x: 400, y: 400, task_id: "ID_4", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test2", description: "Test2 Descriptiond df sd f ", project_id: projectID, x: -400, y: -400, task_id: "ID_5", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test3", description: "Test3 Description", project_id: projectID, x: 0, y: 0, task_id: "ID_6", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test1", description: "Test1 Description", project_id: projectID, x: 400, y: 400, task_id: "ID_7", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test2", description: "Test2 Descriptiond df sd f ", project_id: projectID, x: -400, y: -400, task_id: "ID_8", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test3", description: "Test3 Description", project_id: projectID, x: 0, y: 0, task_id: "ID_9", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test1", description: "Test1 Description", project_id: projectID, x: 400, y: 400, task_id: "ID_10", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test2", description: "Test2 Descriptiond df sd f ", project_id: projectID, x: -400, y: -400, task_id: "ID_11", dependsOn: []
        },
        {
            width: 300, height: 600, name: "Test3", description: "Test3 Description", project_id: projectID, x: 0, y: 0, task_id: "ID_12", dependsOn: []
        }*/
    ];
}

export function getTaskFromDoc(projectID: string, doc: QueryDocumentSnapshot) : TaskInfo {
    return {
        name: doc.get("task_name") ?? "Untitled Task",
        description: doc.get("task_desc") ?? "",
        task_id: doc.id,
        width: doc.get("width") ?? 300,
        height: doc.get("height") ?? 600,
        x: doc.get("x") ?? 0,
        y: doc.get("y") ?? 0,
        project_id: projectID,
        dependsOn: doc.get("depends_on") ?? []
    };
}

export function getGoalFromDoc(doc: QueryDocumentSnapshot): GoalInfo {
    return {
        name: doc.get("name") ?? "Untitled Goal",
        checked: doc.get("checked") ?? false,
        task_id: doc.get("task_id") ?? null,
        timestamp: doc.get("timestamp") ?? 0,
        goal_id: doc.id,
        project_id: doc.get("project_id") ?? null,
        owner_id: doc.get("owner_id") ?? null
    }
}

export default function LoadedProjectPage({ params }) {
    //let [loading, setLoading] = useState(true);
    //let [tasks, setTasksRaw] = useState(null as TaskInfo[]);
    let [loaded, setLoaded] = useState(false);
    let router = useRouter();

    //const tasks = useRef(null as TaskInfo[]);
    //const goals = useRef(null as GoalInfo[]);
    //let [goalCounter, setGoalRerenderCounter] = useState(0);
    //let [taskCounter, setTaskRerenderCounter] = useState(0);
    const [wireMode, setWireMode] = useState(false);

    const [tasks, setTasks] = useState(null as TaskInfo[]);
    const [goals, setGoals] = useState(null as GoalInfo[]);
    const wireContext = useRef(new WireConnectionContextData());

    //console.log(tasks);
    /*if (tasks && !ENABLE_FIREBASE) {
        tasks[0].task_id = (++counter).toString();
    }*/

    /*const setTasks = (newTasks: TaskInfo[]) => {
        tasks.current = newTasks;
        setTaskRerenderCounter(prev => ++prev);
    };

    const setGoals = (newGoals: GoalInfo[]) => {
        goals.current = newGoals;
        setGoalRerenderCounter(prev => ++prev);
    };*/

    //console.log("Tasks = ");
    //console.log(tasks);

    //console.log("Goals = ");
    //console.log(goals);

    let taskDeps: DependencyList = [];
    let goalDeps: DependencyList = [];

    /*if (!ENABLE_FIREBASE) {
        taskDeps = [];
        goalDeps = [];
    }*/

    const moveTask = useCallback((x: number, y: number, task: TaskInfo) => {
        if (!ENABLE_FIREBASE) {
            //setTasks(tasks.current);
            /*task.x = x;
            task.y = y;
            setTasks(tasks => {
                let copy = ShallowCopyArray(tasks);
                UpdateArrayObject(copy, task, obj => {

                });
                return copy;
            });*/

            setTasks(tasks => {
                return UpdateItemInArrayPred(tasks, t => t.task_id === task.task_id, obj => {
                    obj.x = x;
                    obj.y = y;
                });
            });
            return;
        }
        updateDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id), {
            x: x,
            y: y
        }).catch(error => {
            console.error(error);
        });
    }, taskDeps);

    const resizeTask = useCallback((width: number, height: number, task: TaskInfo) => {
        if (!ENABLE_FIREBASE) {
            /*task.x = width;
            task.y = height;
            setTasks(tasks => ShallowCopyArray(tasks));*/
            setTasks(tasks => {
                return UpdateItemInArrayPred(tasks, t => t.task_id === task.task_id, obj => {
                    obj.width = width;
                    obj.height = height;
                });
            });
            return;
        }
        updateDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id), {
            width: width,
            height: height
        }).catch(error => {
            console.error(error);
        });
    }, taskDeps);

    const updateTaskName = useCallback((name: string, task: TaskInfo) => {
        if (!ENABLE_FIREBASE) {
            /*task.name = name;
            setTasks(tasks => ShallowCopyArray(tasks));*/
            setTasks(tasks => {
                return UpdateItemInArrayPred(tasks, t => t.task_id === task.task_id, obj => {
                    obj.name = name;
                });
            });
            return;
        }
        updateDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id), {
            task_name: name
        }).catch(error => {
            console.error(error);
        });
    }, taskDeps);

    const updateTaskDesc = useCallback((desc: string, task: TaskInfo) => {
        if (!ENABLE_FIREBASE) {
            setTasks(tasks => {
                return UpdateItemInArrayPred(tasks, t => t.task_id === task.task_id, obj => {
                    obj.description = desc;
                });
            });
            return;
        }
        updateDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id), {
            task_desc: desc
        }).catch(error => {
            console.error(error);
        });
    }, taskDeps);

    const updateGoalName = useCallback((name: string, goal: GoalInfo) => {
        if (!ENABLE_FIREBASE) {
            /*goal.name = name;
            setGoals(goals => ShallowCopyArray(goals));*/

            setGoals(goals => {
                return UpdateItemInArrayPred(goals, g => g.goal_id === goal.goal_id, obj => {
                    obj.name = name;
                });
            });
            return;
        }
        updateDoc(doc(db, "projects", goal.project_id, "project_tasks", goal.task_id, "goals", goal.goal_id), {
            name: name
        }).catch(error => {
            console.error(error);
        });
    }, goalDeps);

    const updateGoalChecked = useCallback((checked: boolean, goal: GoalInfo) => {
        if (!ENABLE_FIREBASE) {
            /*goal.checked = checked;
            setGoals(goals => ShallowCopyArray(goals));*/
            setGoals(goals => {
                return UpdateItemInArrayPred(goals, g => g.goal_id === goal.goal_id, obj => {
                    obj.checked = checked;
                });
            });
            return;
        }
        updateDoc(doc(db, "projects", goal.project_id, "project_tasks", goal.task_id, "goals", goal.goal_id), {
            checked: checked
        }).catch(error => {
            console.error(error);
        });
    }, goalDeps);

    const deleteTask = useCallback((task: TaskInfo) => {
        if (!ENABLE_FIREBASE) {
            setTasks(tasks => RemoveFromArrayPred(tasks, t => t.task_id === task.task_id));
            /*setTasks(tasks => {
                let newTasks = ShallowCopyArray(tasks);

                let index = newTasks.findIndex(t => t.task_id == task.task_id)
                if (index < 0) {
                    return;
                }
                newTasks.splice(index, 1);

                return newTasks;
            });*/
            return;
        }
        deleteDoc(doc(db, "projects", task.project_id, "project_tasks", task.task_id)).catch(error => {
            console.error(error);
        });
    }, taskDeps);

    const deleteGoal = useCallback((goal: GoalInfo) => {
        if (!ENABLE_FIREBASE) {
            /*let index = goals.current.indexOf(goal);
            if (index < 0) {
                return;
            }
            goals.current.splice(index, 1)

            setGoals(goals.current);*/

            setGoals(goals => RemoveFromArrayPred(goals, g => g.goal_id === goal.goal_id));
            return;
        }
        deleteDoc(doc(db, "projects", goal.project_id, "project_tasks", goal.task_id, "goals", goal.goal_id)).catch(error => {
            console.error(error);
        });
    }, goalDeps);

    const createGoal = useCallback((name: string, checked: boolean, task: TaskInfo) => {
        if (!ENABLE_FIREBASE) {
            /*goals.current.push({
                name: name,
                checked: checked,
                goal_id: crypto.randomUUID(),
                project_id: task.project_id,
                task_id: task.task_id,
                timestamp: Timestamp.fromMillis(Date.now())
            });
            setGoals(goals.current);*/

            setGoals(goals => AddToArray(goals, {
                name: name,
                checked: checked,
                goal_id: crypto.randomUUID(),
                project_id: task.project_id,
                task_id: task.task_id,
                timestamp: Timestamp.fromMillis(Date.now()),
                owner_id: auth.currentUser.uid
            }));
            return;
        }
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
        /*updateDoc(doc(db, "projects", goal.project_id, "project_tasks", goal.task_id, "goals", goal.goal_id), {
            checked: checked
        }).catch(error => {
            console.error(error);
        });*/
    }, goalDeps);

    const changeWireMode = useCallback(() => {
        setWireMode(prev => !prev);
    }, []);

    const createTask = useCallback((name: string = "Untitled Task", description: string = "Insert Description Here", project_id: string = params.projectID, x: number = 0, y: number = 0, width: number = 400, height: number = 600, dependsOn: string[] = []) => {
        if (!ENABLE_FIREBASE) {
            /*tasks.current.push({
                name: name,
                description: description,
                project_id: project_id,
                x: x,
                y: y,
                width: width,
                height: height,
                task_id: crypto.randomUUID(),
                dependsOn: dependsOn
            });
            setTasks(tasks.current);*/
            setTasks(tasks => AddToArray(tasks, {
                name: name,
                description: description,
                project_id: project_id,
                x: x,
                y: y,
                width: width,
                height: height,
                task_id: crypto.randomUUID(),
                dependsOn: dependsOn
            }));
            return;
        }
        addDoc(collection(db, "projects", project_id, "project_tasks"), {
            name: name,
            description: description,
            project_id: project_id,
            x: x,
            y: y,
            width: width,
            height: height
        }).catch(error => {
            console.error(error);
        });
    }, [tasks]);

    const addTaskDependency = useCallback((source: TaskInfo, dependency: TaskInfo) => {
        if (!ENABLE_FIREBASE) {
            if (source.dependsOn.indexOf(dependency.task_id) < 0) {
                setTasks(tasks => UpdateItemInArrayPred(tasks, t => t.task_id === source.task_id, newTask => {
                    newTask.dependsOn = newTask.dependsOn.slice();
                    newTask.dependsOn.push(dependency.task_id);
                }));
            }
            return;
        }

        updateDoc(doc(db, "projects", source.project_id, "project_tasks", source.task_id), {
            dependsOn: arrayUnion(dependency.task_id)
        }).catch(error => {
            console.error(error);
        });
    }, taskDeps);


    const removeTaskDependencies = useCallback((source: TaskInfo, dependencies: string[]) => {
        if (!ENABLE_FIREBASE) {
            console.log("REMOVING DEPENDENCIES = ");
            console.log(dependencies);
            setTasks(tasks => UpdateItemInArrayPred(tasks, t => t.task_id === source.task_id, newTask => {
                newTask.dependsOn = newTask.dependsOn.filter(v => dependencies.indexOf(v) === -1);
            }));
            return;
        }

        updateDoc(doc(db, "projects", source.project_id, "project_tasks", source.task_id), {
            dependsOn: arrayRemove(dependencies)
        }).catch(error => {
            console.error(error);
        });
    }, taskDeps);

    //let [tasks, setTasks] = useState(generateStartingTasks(params.projectID));

    useEffect(() => {

        onFirebaseInit(user => {
            if (!user?.uid) {
                router.push("/projects");
            }
            else {
                setLoaded(true);
            }

            if (ENABLE_FIREBASE) {

                const taskUnsub = onSnapshot(collection(db, "projects", params.projectID, "project_tasks"), result => {
                    setTasks(result.docs.map(d => getTaskFromDoc(params.projectID, d)));
                }, error => {
                    console.error("Failed snapshot for projects");
                    console.error(error);
                });

                const goalUnsub = onSnapshot(query(collectionGroup(db, "goals"), where("owner_id", "==", user.uid), where("project_id", "==", params.projectID)), result => {
                    setGoals(result.docs.map(d => getGoalFromDoc(d)));
                }, error => {
                    console.error("Failed snapshot for goals");
                    console.error(error);
                });

                return () => {
                    taskUnsub();
                    goalUnsub();
                }
            }
            else {

                setTasks(generateDemoTasks(params.projectID));
                setGoals(generateDemoGoals(params.projectID));
            }
        });
    }, []);

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
            //return task.dependsOn.every(dependency => completedTasks[tasks.findIndex(t => t.task_id === dependency)]);
        });

    }, [tasks, goals, completedTasks]);

    //useEffect(() => {
        //console.log("AFTER RENDER TASKS = ");
        //console.log(tasks);

    //}, [tasks]);

    //console.log("TASKS BOTTOM = ");
    //console.log(tasks);

    const taskJSX = useMemo(() => {
        if (!tasks) {
            return <></>
        }
        return tasks.map((t, i) => <Task
            showWires={wireMode}
            dependentTasks={dependenciesAsTasks[i]}
            dependenciesCompleted={dependenciesCompleted[i]}
            goals={taskGoals[i].sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)}/*goals.filter(g => g.task_id == t.task_id).sort((a, b) => a.timestamp.seconds - b.timestamp.seconds)*/
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
    }, [tasks, wireMode, goals, updateGoalName, updateGoalChecked, moveTask, deleteTask, resizeTask, createGoal, updateTaskDesc, updateTaskName, deleteGoal, addTaskDependency]);

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
        <div className={styles.button_controls}>
            {!wireMode && <button onClick={() => createTask()}>Create Task</button>}
            {!wireMode && <button onClick={changeWireMode}>Enable Wire Mode</button>}
            {wireMode && <button onClick={changeWireMode}>Disable Wire Mode</button>}
            <button onClick={exitButton}>Exit</button>
        </div>
    </>
}