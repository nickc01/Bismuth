import { Context, MutableRefObject, createContext } from "react";
import { TaskInfo } from "./components/Task";

// Define the interface for TerminalInfo
export interface TerminalInfo {
    ref: MutableRefObject<HTMLDivElement>,
    isInput: boolean,
    taskInfo: TaskInfo,
    origin: MutableRefObject<HTMLDivElement>
}

// Define the interface for SnapTargets
export interface SnapTargets {
    [key: string]: {
        terminalInfo: TerminalInfo,
        x: number,
        y: number
    }
}

// Define the class for WireConnectionContextData
export class WireConnectionContextData {
    inputColor: string = "rgb(0,255,0,0.5)";
    outputColor: string = "rgb(255,0,0,0.5)";
    terminalList: TerminalInfo[] = [];
    draggedWire: MutableRefObject<HTMLDivElement> = null;
    snappedID: string = null;
    onSnap: (info: TerminalInfo, x: number, y: number) => void = null;
    onUnsnap: () => void = null;
    snapTargets: SnapTargets = {};

    // Add a snap target to the snapTargets object
    addSnapTarget(info: TerminalInfo, x: number, y: number): string {
        let id = crypto.randomUUID();
        this.snapTargets[id] = {
            x: x,
            y: y,
            terminalInfo: info
        }

        if (this.snappedID !== null) {
            if (this.draggedWire !== null) {
                this.onUnsnap?.();
            }

            this.snappedID = null;
        }

        this.snappedID = id;
        if (this.draggedWire !== null) {
            this.onSnap?.(info, x, y);
        }

        return id;
    }

    // Remove a snap target from the snapTargets object
    removeSnapTarget(id: string) {
        if (id in this.snapTargets) {
            delete this.snapTargets[id];
        }

        if (this.draggedWire !== null) {
            this.onUnsnap?.();
        }
    }

    // Start the snapping behavior when a wire is dragged
    startSnappingBehavior(sourceWire: MutableRefObject<HTMLDivElement>, snap: (info: TerminalInfo, x: number, y: number) => void, unsnap: () => void) {
        this.onSnap = snap;
        this.onUnsnap = unsnap;
        this.draggedWire = sourceWire;

        const keys = Object.keys(this.snapTargets);

        if (keys.length > 0) {
            this.snappedID = keys[0];
            this.onSnap?.(this.snapTargets[this.snappedID].terminalInfo, this.snapTargets[this.snappedID].x, this.snapTargets[this.snappedID].y);
        }
    }

    // Stop the snapping behavior when a wire is released
    stopSnappingBehavior() {
        if (this.snappedID !== null) {
            if (this.draggedWire !== null) {
                this.onUnsnap?.();
            }

            this.snappedID = null;
        }
        this.draggedWire = null;

        this.snapTargets = {};
    }

    // Add a loaded terminal to the terminalList
    addLoadedTerminal(terminal: TerminalInfo) {
        const index = this.terminalList.findIndex(t => t.ref == terminal.ref);
        if (index < 0) {
            this.terminalList.push(terminal);
            return true;
        }
        return false;
    }

    // Remove a loaded terminal from the terminalList
    removeLoadedTerminal(ref: MutableRefObject<HTMLDivElement>) {
        const index = this.terminalList.findIndex(t => t.ref == ref);
        if (index > -1) {
            this.terminalList.splice(index, 1);
            return true;
        }
        return false;
    }
};

const WireConnectionContext: Context<WireConnectionContextData> = createContext(null);

export default WireConnectionContext;