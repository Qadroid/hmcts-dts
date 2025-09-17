import { RequestHandler } from "@sveltejs/kit";
import pb from "$lib/pocketbase.ts";

// General use for below
const handleResponse = (data: {
	error?: string;
	result?: any;
	id?: string;
}, status: number) => {
	return new Response(
		JSON.stringify(data),
		{
			status,
			headers: { "Content-Type": "application/json" },
		},
	);
};

// CRUD operations for tasks

export const GET: RequestHandler = async ({ url }) => {
	// If an ID is provided, fetch a single task
	const taskId = url.searchParams.get("id");
	if (taskId) {
		try {
			const task = await pb.collection("tasks").getOne(taskId);
			return handleResponse({ result: task }, 200);
		} catch (error) {
			console.error("Error fetching task:", error);
			return handleResponse({ error: "Task not found" }, 404);
		}
	}

	// Otherwise, fetch all tasks
	try {
		const tasks = await pb.collection("tasks").getFullList();
		return handleResponse({ result: tasks }, 200);
	} catch (error) {
		console.error("Error fetching tasks:", error);
		return handleResponse({ error: "Failed to fetch tasks" }, 500);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	// Ensure request is defined
	if (!request) {
		return handleResponse({ error: "No request data" }, 400);
	}

	const formData = await request.formData();

	// Required fields for a new task
	if (!formData.get("title")) {
		return handleResponse({ error: "Title is required" }, 400);
	} else if (!formData.get("due")) {
		return handleResponse({ error: "Due date/time is required" }, 400);
	}

	const newTask: { [key: string]: string } = {};

	for (const key of formData.keys()) {
		try {
			newTask[key] = formData.get(key) as string;
		} catch (error) {
			console.error("Error processing form data:", error);
		}
	}

	try {
		const response = await pb.collection("tasks").create(newTask);
		return handleResponse({ id: response.id }, 201);
	} catch (error) {
		console.error("Error creating task:", error);
		return handleResponse({ error: "Failed to create task" }, 500);
	}
};

export const PATCH: RequestHandler = async ({ request, url }) => {
	const taskId = url.searchParams.get("id");
	const formData = await request.formData();

	// Ensure request is defined
	if (!request) {
		return handleResponse({ error: "No request data" }, 400);
	} else if (!taskId) {
		return handleResponse({ error: "No task ID provided" }, 400);
	} else if (!formData) {
		return handleResponse({ error: "No form data provided" }, 400);
	}

	const updatedTask: { [key: string]: string } = {};

	for (const key of formData.keys()) {
		try {
			updatedTask[key] = formData.get(key) as string;
		} catch (error) {
			console.error("Error processing form data:", error);
		}
	}

	try {
		const response = await pb.collection("tasks").update(taskId, updatedTask);
		return handleResponse({ id: response.id }, 200);
	} catch (error) {
		console.error("Error updating task:", error);
		return handleResponse({ error: "Failed to update task" }, 500);
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	const taskId = url.searchParams.get("id");

	if (!taskId) {
		return handleResponse({ error: "Missing task ID" }, 400);
	}

	try {
		await pb.collection("tasks").delete(taskId);
		return handleResponse({ id: taskId }, 200);
	} catch (error) {
		console.error("Error deleting task:", error);
		return handleResponse({ error: "Failed to delete task" }, 500);
	}
};
