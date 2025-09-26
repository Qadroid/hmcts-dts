import * as pb from "$lib/pocketbase.ts";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
	try {
		const data = await event.request.formData();
		data.append("id", event.params.id);
		return json(await pb.getTask(data), { status: 200 });
	} catch (error) {
		console.error("Error fetching task:", error);
		return json({ message: "Failed to fetch task" }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async (event) => {
	try {
		const data = new FormData();
		for (const [key, value] of await event.request.formData()) {
			data.append(key, value);
		}
		data.append("id", event.params.id);
		return json(
			{
				success: await pb.updateTask(data),
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating task:", error);
		return json({ message: "Failed to update task" }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const data = new FormData();
		data.append("id", event.params.id);
		return json(
			{ success: await pb.deleteTask(data) },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting task:", error);
		return json({ message: "Failed to delete task" }, { status: 500 });
	}
};
