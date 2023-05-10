import styles from "../../styles/ConfirmationBox.module.css";


export interface ConfirmationBoxProps {
    title?: string,
    bodyText: string,
    onConfirm: (confirmed: boolean) => void
}

export default function ConfirmationBox({ bodyText, onConfirm }: ConfirmationBoxProps) {
    return <div className={styles.confirmation_box}>
        <h1>{bodyText}</h1>
        <div className={styles.button_container}>
            <button onClick={() => onConfirm(false)}>No</button>
            <button onClick={() => onConfirm(true)}>Yes</button>
        </div>
    </div>
}