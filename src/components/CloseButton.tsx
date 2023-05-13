import styles from "../../styles/CloseButton.module.css";

// Define the props for the CloseButton component
export interface CloseButtonProps {
    width?: string,
    height?: string,
    borderRadius?: string,
    backgroundColor?: string,
    onClose?: () => void
}

// Define the CloseButton component
export default function CloseButton({ width = "4rem", height = "100%", borderRadius = "1rem", backgroundColor = "var(--secondary-color)", onClose }: CloseButtonProps) {
    return (
        <div
            onClick={() => onClose?.()}
            className={styles.close_button}
            style={{ width: width, height: height, borderRadius: borderRadius, backgroundColor: backgroundColor }}
        >
            <div className={`${styles.close_button_rect} ${styles.left}`}></div>
            <div className={`${styles.close_button_rect} ${styles.right}`}></div>
        </div>
    );
}
