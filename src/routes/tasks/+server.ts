import type { RequestHandler } from "./$types.d.ts";
import { pocketbase } from "$lib/pocketbase.ts";
import { json } from "@sveltejs/kit";
import { taskSchema } from "$lib/schemas/TaskSchema.ts";

export const GET: RequestHandler = async () => {
	try {
		const response = await pocketbase.collection("tasks").getFullList();
		return json( response, { status: 200 } );
	} catch (error) {
		console.error("Error fetching tasks:", error);
		return json({ message: "Failed to fetch tasks" }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const form = taskSchema.safeParse(Object.fromEntries(await request.formData()));
	if (!form.success) {
		return json({ message: "Invalid task data", errors: form.error }, { status: 400 });
	}
	const data = form.data;
	try {
		return json(
			await pocketbase.collection("tasks").create(data),
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating task:", error);
		return json({ message: "Failed to create task" }, { status: 500 });
	}
};
