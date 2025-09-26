import * as pb from "$lib/pocketbase.ts";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
	try {
		return json(await pb.getTask(event.params.id), { status: 200 });
	} catch (error) {
		console.error("Error fetching task:", error);
		return json({ message: "Failed to fetch task" }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async (event) => {
	try {
		return json(
			{
				success: await pb.updateTask(
					event.params.id,
					await event.request.formData(),
				),
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
		return json(
			{ success: await pb.deleteTask(event.params.id) },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting task:", error);
		return json({ message: "Failed to delete task" }, { status: 500 });
	}
};
