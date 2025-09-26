import type { RequestHandler } from "./$types";
import * as pb from "$lib/pocketbase.ts";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
	try {
		return json(await pb.getTasks());
	} catch (error) {
		console.error("Error fetching tasks:", error);
		return json({ message: "Failed to fetch tasks" }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		return json(
			await pb.createTask(await request.formData()),
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating task:", error);
		return json({ message: "Failed to create task" }, { status: 500 });
	}
};
