import { useCallback } from "react";
import styles from "../../styles/ZoomControls.module.css";
import { isMobile } from "mobile-device-detect";
import ZoomBasedDiv from "./ZoomBasedDiv";


export interface ZoomControlsProps {
    onZoom: (zoomDiff: number) => void
}

export default function ZoomControls({ onZoom }: ZoomControlsProps) {

    const increaseZoom = useCallback((zoom: number) => {
        onZoom?.(zoom);
    }, [onZoom]);

    return <ZoomBasedDiv transformOrigin="100% 100%" mainClass={styles.zoom_controls}>
        <button onClick={() => increaseZoom(0.25)} style={{ display: isMobile ? "none" : "block" }}>+</button>
        <button onClick={() => increaseZoom(-0.25)} style={{ display: isMobile ? "none" : "block" }}>-</button>
    </ZoomBasedDiv>
}