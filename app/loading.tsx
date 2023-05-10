import LoadingIcon from "../src/components/LoadingIcon";
import styles from "../styles/app.loading.module.css"



export default function Loading() {
    return <div className={styles.loading_container}>
        <LoadingIcon />
    </div>
}