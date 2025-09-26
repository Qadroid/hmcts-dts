import Pocketbase from "Pocketbase";
import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
import { existingTaskSchema, taskSchema } from "$lib/schemas/TaskSchema.ts";

const pocketbase = new Pocketbase(PUBLIC_POCKETBASE_URL);

export function getTasks() {
	try {
		return pocketbase.collection("tasks").getFullList();
	} catch (error) {
		console.error("Error fetching tasks:", error);
		throw new Error("Failed to fetch tasks");
	}
}

export function createTask(task: FormData) {
	try {
		const parsed = taskSchema.parse(Object.fromEntries(task));
		console.log("Unparsed data:", Object.fromEntries(task));
		console.log("Parsed data:", parsed);
		if (!parsed) throw new Error("Invalid task data");
		return pocketbase.collection("tasks").create(parsed);
	} catch (error) {
		console.error("Error creating task:", error);
		throw new Error("Failed to create task");
	}
}

export function getTask(id: string) {
	try {
		const parsed = existingTaskSchema.parse({ id });
		if (!parsed) throw new Error("Invalid ID");
		return pocketbase.collection("tasks").getOne(parsed.id);
	} catch (error) {
		console.error("Error fetching task:", error);
		throw new Error("Failed to fetch task");
	}
}

export function updateTask(id: string, task: FormData) {
	try {
		const parsed = existingTaskSchema.parse(task);
		if (!parsed) throw new Error("Invalid task data");
		return pocketbase.collection("tasks").update(id, parsed);
	} catch (error) {
		console.error("Error updating task:", error);
		throw new Error("Failed to update task");
	}
}

export function deleteTask(id: string) {
	try {
		const parsed = existingTaskSchema.parse({ id });
		if (!parsed) throw new Error("Invalid ID");
		return pocketbase.collection("tasks").delete(parsed.id);
	} catch (error) {
		console.error("Error deleting task:", error);
		throw new Error("Failed to delete task");
	}
}
