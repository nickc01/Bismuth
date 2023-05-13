import loading from "../../public/loading.svg"
import Image from "next/image";
import styles from "../../styles/LoadingIcon.module.css"

// Define the props for the LoadingIcon component
export interface LoadingIconProps {
    size?: number; // Optional prop for the size of the loading icon
}

// Define the LoadingIcon component
export default function LoadingIcon({ size = 100 }: LoadingIconProps) {
    return (
        <div className={styles.loading_icon}>
            <Image src={loading} height={size} width={size} alt="Loading Icon" />
        </div>
    );
}