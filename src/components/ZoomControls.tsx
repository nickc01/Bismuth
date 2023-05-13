import { useCallback } from "react";
import styles from "../../styles/ZoomControls.module.css";
import { isMobile } from "mobile-device-detect";
import ZoomBasedDiv from "./ZoomBasedDiv";

// Define the props for the ZoomControls component
export interface ZoomControlsProps {
    onZoom: (zoomDiff: number) => void
}

// Define the ZoomControls component
export default function ZoomControls({ onZoom }: ZoomControlsProps) {

    // Define a memoized callback function to handle zooming
    const increaseZoom = useCallback((zoom: number) => {
        onZoom?.(zoom);
    }, [onZoom]);

    // Render the ZoomControls component
    return (
        <ZoomBasedDiv transformOrigin="100% 100%" mainClass={styles.zoom_controls}>
            <button onClick={() => increaseZoom(0.25)} style={{ display: isMobile ? "none" : "block" }}>+</button>
            <button onClick={() => increaseZoom(-0.25)} style={{ display: isMobile ? "none" : "block" }}>-</button>
        </ZoomBasedDiv>
    );
}
