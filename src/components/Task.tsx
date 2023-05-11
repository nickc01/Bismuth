import { useRef, useCallback, useState, useContext, useEffect, MutableRefObject, useMemo } from "react";
import styles from "../../styles/Task.module.css"
import { ExpandableAreaContext, Rect } from "./ExpandableArea";
import AreaNode from "./AreaNode";
import NodeMover from "./NodeMover";
import NodeResizer from "./NodeResizer";
import EditableText from "./EditableText";
import GoalField from "./GoalField";
import ConfirmationBox from "./ConfirmationBox";
import { FieldValue, Timestamp } from "firebase/firestore";
import WireTerminal from "./WireTerminal";

export interface GoalInfo {
	task_id: string,
	name: string,
	checked: boolean,
	timestamp: Timestamp,
	project_id: string,
	owner_id: string,
	goal_id: string
}

export interface TaskInfo extends Rect {
	name: string,
	description: string,
	project_id: string,
	task_id: string,
	dependsOn: string[]
}

export interface TaskProps {
	taskInfo: TaskInfo,
	goals: GoalInfo[],
	showWires?: boolean,
	onTaskMove?: (x: number, y: number, task: TaskInfo) => void
	onTaskResize?: (width: number, height: number, task: TaskInfo) => void,
	onNameUpdate?: (name: string, task: TaskInfo) => void,
	onDescUpdate?: (desc: string, task: TaskInfo) => void,
	onGoalNameUpdate?: (name: string, goal: GoalInfo) => void,
	onGoalCheckUpdate?: (checked: boolean, goal: GoalInfo) => void,
	onTaskDelete?: (task: TaskInfo) => void
	onCreateGoal?: (name: string, checked: boolean, task: TaskInfo) => void,
	onDeleteGoal?: (goal: GoalInfo) => void,
	addTaskDependency?: (source: TaskInfo, dependency: TaskInfo) => void,
	removeTaskDependencies?: (source: TaskInfo, dependencies: string[]) => void,
	dependentTasks: TaskInfo[],
	dependenciesCompleted: boolean[]
}


export default function Task({ showWires = true, taskInfo, goals, onTaskMove, onTaskResize, onNameUpdate, onDescUpdate, onGoalNameUpdate, onGoalCheckUpdate, onTaskDelete, onCreateGoal, onDeleteGoal, addTaskDependency, removeTaskDependencies, dependentTasks, dependenciesCompleted }: TaskProps) {

	const [deleting, setDeleting] = useState(false);

	const onUpdatePosition = useCallback((x: number, y: number) => {
		taskInfo.x = x;
		taskInfo.y = y;
		onTaskMove?.(x, y, taskInfo);
	}, [taskInfo, onTaskMove]);

	const onUpdateSize = useCallback((width: number, height: number) => {
		taskInfo.width = width;
		taskInfo.height = height;
		onTaskResize?.(width, height, taskInfo);
	}, [taskInfo, onTaskResize]);

	const onNameChanged = useCallback((name: string) => {
		taskInfo.name = name;
		onNameUpdate?.(name, taskInfo);
	}, [taskInfo, onNameUpdate]);

	const onDescChanged = useCallback((desc: string) => {
		taskInfo.description = desc;
		onDescUpdate?.(desc, taskInfo);
	}, [taskInfo, onDescUpdate]);

	const onXPressed = useCallback(() => {
		setDeleting(true);
	},[]);

	const onConfirmDelete = useCallback((confirmed: boolean) => {
		if (confirmed) {
			onTaskDelete?.(taskInfo);
		}
		setDeleting(false);
	}, [taskInfo, onTaskDelete]);



	const dependency = useMemo(() => {
		for (let i = 0; i < dependentTasks.length; i++) {
			if (!dependenciesCompleted[i]) {
				return dependentTasks[i];
			}
			//return dependentTasks[i];
		}
		return null;
	}, [dependentTasks]);

	const onGoalCheck = useCallback((checked: boolean, goal: GoalInfo) => {
		if (!dependency) {
			onGoalCheckUpdate?.(checked, goal);
			return true;
		}
		return false;
	}, [dependency, onGoalCheckUpdate]);

	/*const onGoalNameChange = useCallback((name: string, goal: GoalInfo) => {
		goal.goal_name = name;
		onGoalNameUpdate?.(name, taskInfo, goal);
	}, [taskInfo, onGoalNameUpdate]);

	const onGoalCheckChange = useCallback((checked: boolean, goal: GoalInfo) => {
		goal.goal_completed = checked;
		onGoalCheckUpdate?.(checked, taskInfo, goal);
	}, [taskInfo, onGoalCheckUpdate]);*/

	return <AreaNode key={taskInfo.task_id} id={taskInfo.task_id} left={taskInfo.x} top={taskInfo.y} width={taskInfo.width} height={taskInfo.height}>
		<div className={styles.delete_button} onClick={onXPressed}>
			<div className={styles.x_line} />
			<div className={styles.x_line} />
		</div>
		<NodeMover onUpdatePosition={onUpdatePosition}>
			<NodeResizer onUpdateSize={onUpdateSize}>
				<div className={`${styles.task} ${showWires && styles.disable_text_highlighting}`}>
					<EditableText sizeLimit={100} key="name_text" textClass={styles.title_text} text={taskInfo.name} onTextUpdate={onNameChanged} />
					<EditableText sizeLimit={1000} key="desc_test" textClass={styles.description_text} multiline={true} text={taskInfo.description} onTextUpdate={onDescChanged} />
					<br />
					{dependency && <div className={styles.dependency_block}>
						This task requires "{dependency.name}" to be completed first
					</div>}
					<h3>Goals</h3>
					{goals.map((g, i) => <GoalField onDelete={onDeleteGoal} onNameChange={onGoalNameUpdate} onCompletionChange={onGoalCheck} key={i} goalInfo={g} />)}
					<button onClick={() => onCreateGoal?.("Untitled Goal", false, taskInfo)}>Add Goal</button>
					{deleting && <ConfirmationBox onConfirm={onConfirmDelete} bodyText="Are you sure you want to delete this task?"></ConfirmationBox>}
				</div>
			</NodeResizer>
		</NodeMover>
		{showWires && <div className={styles.input_blocker} />}
		{showWires && <>
			<div className={`${styles.wire} ${styles.top_left_wire}`}>
				<WireTerminal taskInfo={taskInfo} isInput={true} addTaskDependency={addTaskDependency} removeTaskDependencies={removeTaskDependencies} />
			</div>
			<div className={`${styles.wire} ${styles.bottom_right_wire}`}>
				<WireTerminal taskInfo={taskInfo} isInput={false} addTaskDependency={addTaskDependency} removeTaskDependencies={removeTaskDependencies} />
			</div>
		</>}
	</AreaNode>
}