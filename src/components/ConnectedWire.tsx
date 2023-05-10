import styles from "../../styles/WireLine.module.css"
import { angleToPoint, getDistance } from "./WireLine";


export interface ConnectedWireProps {
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    startColor?: string,
    endColor?: string
}


export default function ConnectedWire({ startX, startY, endX, endY, startColor = "rgba(255,0,0,1)", endColor = "rgba(0,255,0,1)" }: ConnectedWireProps) {
    //distance + (0.025 * distance) + 40
    const distance = getDistance(startX, startY, endX, endY) + 32;
    const angle = angleToPoint(startX, startY, endX, endY);

    return <><div className={styles.wire_line} style={{ left: startX, top: startY, transform: `rotate(${angle}deg)`, width: `${distance}px` }}>
        <div className={styles.wire_line_inside} style={{ background: `linear-gradient(90deg, ${startColor} 0%, ${endColor} 100%)` }}>

        </div>
    </div>
    </>
}