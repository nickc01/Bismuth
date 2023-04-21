import Head from 'next/head';
import styles from '../styles/Home.module.css';
//import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { auth, db } from '../firebase/firebase_init';
import { createUserWithEmailAndPassword } from "firebase/auth";
import Auth from "../src/components/Auth";
import { useEffect, useState } from 'react';
import { getDocs, collection, addDoc } from "firebase/firestore";
import TaskList from '../src/components/TaskList';
import { coolvetica } from '../src/global';


export default function App() {
  const [taskList, setTaskList] = useState([]);

  //New Task States
  const [taskName, setTaskName] = useState("");
  const [taskCompleted, setTaskCompleted] = useState(false);

  const tasksCollectionRef = collection(db,"tasks");

  useEffect(() => {
    const getTaskList = async function() {
      try {
        const data = await getDocs(tasksCollectionRef);
        const filteredData = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
        console.log(filteredData);
        setTaskList(filteredData);
      } catch (error) {
          console.error(error);
      }
    }

    getTaskList();
  }, []);

  /*const onSubmitMovie = async () => {
      try
      {
          await addDoc(tasksCollectionRef,{name: taskName, completed: taskCompleted});
      }
      catch (error)
      {
          console.error(error);
      }
  };*/

  return (
    <div className='login-container'>
        <h1 className={coolvetica.className}>Bismuth</h1>
        <h3>Project Task Tracker</h3>
        <Auth onLogin={null} onStateChange={null}></Auth>
        <style jsx>{`
          .login-container {
              width: 100vw;
              height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
          }

          h1 {
            font-size: min(12rem, calc(30vw - 2rem));
          }
        `}</style>
    </div>
  )
}

/*
        <input onChange={e => setTaskName(e.target.value)} value={taskName} placeholder='Task Name...'></input>
        <input onChange={e => setTaskCompleted(e.target.checked)} checked={taskCompleted} type='checkbox'></input>
        <label>Completed</label>
        <button onClick={onSubmitMovie}>Submit Task</button>
*/

//<StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}></StyledFirebaseAuth>
/*
        <TaskList></TaskList>

        <div>
          {taskList.map((task) => (
            <div id={task.id}>
              <h1>{task.name}</h1>
              <p>{task.completed ? "true" : "false"}</p>
            </div>
          ))}
        </div>
*/