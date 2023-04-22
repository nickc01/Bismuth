import ProjectSelector from "../../src/components/ProjectSelector";
import { coolvetica } from "../../src/global";

import styles from "../../styles/Projects.module.css"




export default function ProjectsPage() {

    function startCreatingProject() {

    }

    function logout() {
        
    }

    return (
    <div className={styles.project_page_container}>
        <h1 className={`${coolvetica.className} ${styles.logo}`}>Bismuth</h1>
        <div className={styles.project_selector_flex}>
            <ProjectSelector/>
            <div id={styles.bottom_row}>
                <button className={styles.logout_button}>Logout</button>
                <button className={styles.create_button}>Create Project</button>
            </div>
        </div>
    </div>);

}