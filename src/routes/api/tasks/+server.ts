import type { RequestHandler } from "@sveltejs/kit";
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
			console.error("Task not found:", error);
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
	} else if (!formData.get("due") || isNaN(Date.parse(formData.get("due") as string))) {
		return handleResponse({ error: "Due date/time is invalid" }, 400);
	}

	interface CreateTaskInterface {
		title: string;
		description?: string;
		due: string;
		status?: boolean;
	}

	const newTask: CreateTaskInterface = {
		title: formData.get("title") as string,
		due: formData.get("due") as string,
	};
	if (formData.get("description")) {
		newTask.description = formData.get("description") as string;
	}
	if (formData.get("status")) {
		newTask.status = formData.get("status") === "true" ? true : false;
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
	let taskId: string | null = null;
	let formData: FormData | null = null;

	try {
		taskId = url.searchParams.get("id");
	} catch (error) {
		console.error("Error retrieving task ID:", error);
		return handleResponse({ error: "No task ID provided" }, 400);
	}

	try {
		formData = await request.formData();
	} catch (error) {
		console.error("Error parsing form data:", error);
		return handleResponse({ error: "No form data provided" }, 400);
	}

	// Ensure request is defined
	if (!request) {
		return handleResponse({ error: "No request data" }, 400);
	} else if (!taskId) {
		return handleResponse({ error: "No task ID provided" }, 400);
	} else if (!formData) {
		return handleResponse({ error: "No form data provided" }, 400);
	}

	interface UpdateTaskInterface {
		title?: string;
		description?: string;
		due?: string;
		status?: boolean;
	}

	const updatedTask: UpdateTaskInterface = {};

	if (formData.get("title")) {
		updatedTask.title = formData.get("title") as string;
	}
	if (formData.get("description")) {
		updatedTask.description = formData.get("description") as string;
	}
	if (formData.get("due")) {
		updatedTask.due = formData.get("due") as string;
		if (isNaN(Date.parse(updatedTask.due))) {
			return handleResponse({ error: "Due date/time is invalid" }, 400);
		}
	}
	if (formData.get("status")) {
		updatedTask.status = formData.get("status") === "true" ? true : false;
	}

	try {
		const response = await pb.collection("tasks").update(taskId, updatedTask);
		return handleResponse({ id: response.id }, 200);
	} catch (error) {
		console.error("Task doesn't exist:", error);
		return handleResponse({ error: "Task not found" }, 404);
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
		console.error("Task not found:", error);
		return handleResponse({ error: "Task not found" }, 404);
	}
};
