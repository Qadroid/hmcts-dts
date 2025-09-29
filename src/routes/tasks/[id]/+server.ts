import pocketbase from "$lib/pocketbase.ts";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types.d.ts";
import { existingTaskSchema } from "$lib/schemas/TaskSchema.ts";

export const GET: RequestHandler = async (event) => {
	const id = event.params.id;
	if (!id) {
		return json({ message: "Task ID is required" }, { status: 400 });
	}
	try {
		const response = await pocketbase.collection("tasks").getOne(id);
		return json({ response }, { status: 200 });
	} catch (error) {
		console.error("Error fetching task:", error);
		return json({ message: "Failed to fetch task" }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async (event) => {
	const formData = await event.request.formData();
	if (!event.params.id) {
		return json({ message: "Task ID is required" }, { status: 400 });
	}
	formData.append("id", event.params.id);
	const data = existingTaskSchema.safeParse(Object.fromEntries(formData));
	if (!data.success) {
		return json({ message: "Invalid task data", errors: data.error }, { status: 400 });
	}
	try {
		const response = await pocketbase.collection("tasks").update(
			data.data.id,
			data.data,
		);
		if (!response) {
			return json({ message: "Failed to update task" }, { status: 500 });
		}
		return json(
			{ response },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating task:", error);
		return json({ message: "Failed to update task" }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const id = event.params.id;
	if (!id) {
		return json({ message: "Task ID is required" }, { status: 400 });
	}
	const parsed = existingTaskSchema.safeParse({ id });
	if (!parsed.success) {
		return json({ message: "Invalid task ID", errors: parsed.error }, { status: 400 });
	}
	try {
		const response = await pocketbase.collection("tasks").delete(id);
		return json(
			{ response },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting task:", error);
		return json({ message: "Failed to delete task" }, { status: 500 });
	}
};
