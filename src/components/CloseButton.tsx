import styles from "../../styles/CloseButton.module.css"


export interface CloseButtonProps {
    width?: string,
    height?: string,
    onClose?: () => void
}


export default function CloseButton({width = "4rem", height = "100%", onClose}: CloseButtonProps) {
    return <div onClick={() => onClose?.()} className={styles.close_button} style={{width: width, height: height}}>
        <div className={`${styles.close_button_rect} ${styles.left}`}></div>
        <div className={`${styles.close_button_rect} ${styles.right}`}></div>
    </div>
}