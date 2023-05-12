import { useCallback } from "react";
import styles from "../../styles/WireLine.module.css"


export interface WireLineProps {
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    startColor?: string,
    endColor?: string,
    wireID?: string,
    offset?: string,
    onClick?: (wireID: string) => void
}


export function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1),2));
}

export function angleToPoint(x1: number, y1: number, x2: number, y2: number) {
    return 180 * Math.atan2(y2 - y1, x2 - x1) / Math.PI;
}


export default function WireLine({ startX, startY, endX, endY, startColor = "rgba(255,0,0,1)", endColor = "rgba(0,255,0,1)", onClick, wireID, offset }: WireLineProps) {
    //distance + (0.025 * distance) + 40

    //const distance_adjust = 32; //REM = 16
    //const distance_adjust = 64; //REM = 32

    //const distance_adjust =

    //const offset = "1rem";
    //console.log("offset = " + offset);

    const distance = getDistance(startX, startY, endX, endY);
    const angle = angleToPoint(startX, startY, endX, endY);


    const clickCallback = useCallback(() => {
        onClick?.(wireID);
    }, [wireID, onClick]);

    return <><div className={`${styles.wire_line} ${onClick ? styles.hover_line : ""}`} onClick={onClick ? clickCallback : undefined} style={{ left: `calc(${startX}px + ${offset})`, top: `calc(${startY}px + ${offset})`, transform: `rotate(${angle}deg)`, width: `calc(${distance}px + 2rem)` }}>
        <div className={`${styles.wire_line_inside}` } style={{ background: `linear-gradient(90deg, ${startColor} 0%, ${endColor} 100%)` }}>
        </div>
    </div>
        
    </>
}

//<div className={styles.test} style={{ left: `calc(${endX}px + ${offset})`, top: `calc(${endY}px + ${offset})` }}></div>