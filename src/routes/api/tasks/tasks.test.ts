/// <reference lib="deno.ns" />

import Pocketbase from "pocketbase";
import { assertEquals } from "jsr:@std/assert";

const pbUrl = Deno.env.get("PUBLIC_POCKETBASE_URL");
const taskApiUrl = "http://127.0.0.1:5173/api/tasks";

const pb = new Pocketbase(pbUrl);

let knownTaskId: string[] = [];

async function getAllTasks() {
	const response = await pb.collection("tasks").getFullList();
	return response;
}

async function getTaskById(id: string) {
	const response = await pb.collection("tasks").getOne(id);
	return response;
}

//
// Basic tests for the /api/tasks endpoint
// These tests assume a local Pocketbase instance is running with the correct schema
// and some pre-existing data.
//

Deno.test("Fetch all tasks", async () => {
	const response = await fetch(taskApiUrl);
	if (response.ok) {
		const data = await response.json();
		if (data.result && Array.isArray(data.result) && data.result.length > 0) {
			knownTaskId.push(data.result[0].id);
		}
		assertEquals(response.status, 200, "Expected status 200");
		assertEquals(
			Array.isArray(data.result),
			true,
			"Expected result to be an array",
		);
		assertEquals(
			data.result,
			await getAllTasks(),
			"Expected fetched tasks to match Pocketbase data",
		);
	} else {
		assertEquals(response.ok, true);
	}
});

Deno.test("Fetch single task", async () => {
	knownTaskId = await getAllTasks().then((tasks) =>
		tasks.map((task: any) => task.id)
	);
	if (knownTaskId.length === 0) {
		console.warn("No known task IDs available to fetch a single task.");
		return;
	}

	const id = knownTaskId[0];
	const response = await fetch(taskApiUrl + `/?id=${id}`);
	if (response.ok) {
		const data = await response.json();
		assertEquals(response.status, 200);
		assertEquals(data.result.id, id);
		assertEquals(data.result, await getTaskById(id));
	} else {
		console.error("Failed to fetch task:", response.statusText);
		assertEquals(response.ok, true);
	}
});

Deno.test("Fetch Non-Existent Task via API", async () => {
	const fakeId = "nonexistentid12345";
	const response = await fetch(taskApiUrl + `/?id=${fakeId}`);
	if (!response.ok) {
		const data = await response.json();
		assertEquals(data.error, "Task not found");
		assertEquals(response.status, 404);
	} else {
		console.error("Different error than expected:", response.statusText);
	}
});

Deno.test("Create and Cleanup Task via API", async (t) => {
	const testData: FormData = new FormData();
	testData.append("title", "Test Temp Task");
	testData.append("description", "This task will be deleted after creation.");
	testData.append("due", new Date().toISOString());
	testData.append("status", "true");

	let dataId: string;

	await t.step("Create Valid Task", async () => {
		let createResponse: Response;
		try {
			createResponse = await fetch(taskApiUrl, {
				method: "POST",
				body: testData,
			});
		} catch (error) {
			console.error("Error during fetch:", error);
			return;
		}

		if (createResponse.ok) {
			const data = await createResponse.json();
			dataId = data.id;
			const taskCheck = await getTaskById(dataId);
			assertEquals(createResponse.status, 201);
			assertEquals(testData.get("title"), taskCheck.title);
			assertEquals(testData.get("description"), taskCheck.description);
			const expectedDate = new Date(testData.get("due") as string)
				.toISOString();
			const actualDate = new Date(taskCheck.due).toISOString();
			assertEquals(expectedDate, actualDate);
			assertEquals(testData.get("status"), taskCheck.status.toString());
		} else {
			console.error("Failed to create task:", createResponse.statusText);
		}
	});

	await t.step("Cleanup Created Task", async () => {
		let deleteResponse: Response;
		try {
			deleteResponse = await fetch(taskApiUrl + `/?id=${dataId}`, {
				method: "DELETE",
			});
			await deleteResponse.body?.cancel();
			assertEquals(deleteResponse.status, 200);
			if (deleteResponse.ok) {
				try {
					const fetchDeleted = await fetch(taskApiUrl + `/?id=${dataId}`);
					fetchDeleted.body?.cancel();
					assertEquals(fetchDeleted.status, 404);
				} catch (error) {
					console.error("Error checking for deleted task:", error);
				}
			} else {
				console.error("Failed to delete task:", deleteResponse.statusText);
			}
		} catch (error) {
			console.error("Error deleting task:", error);
		}
	});
});

Deno.test("Update Task (creates task)", async () => {
	const createData: FormData = new FormData();
	createData.append("title", "Task to Update");
	createData.append("description", "This task will be updated.");
	createData.append("due", new Date().toISOString());
	createData.append("status", "false");

	let dataId: string;
	let createResponse: Response;
	try {
		createResponse = await fetch(taskApiUrl, {
			method: "POST",
			body: createData,
		});
	} catch (error) {
		console.error("Error during fetch:", error);
		return;
	}

	if (createResponse.ok) {
		const data = await createResponse.json();
		dataId = data.id;
	} else {
		console.error(
			"Failed to create task for update test:",
			createResponse.statusText,
		);
		return;
	}

	const updateData: FormData = new FormData();
	updateData.append("title", "Updated Task Title");
	updateData.append("description", "The task description has been updated.");
	updateData.append("due", new Date(Date.now() + 86400000).toISOString()); // +1 day
	updateData.append("status", "true");

	let updateResponse: Response;
	try {
		updateResponse = await fetch(taskApiUrl + `/?id=${dataId}`, {
			method: "PATCH",
			body: updateData,
		});
		await updateResponse.body?.cancel();
	} catch (error) {
		console.error("Error during update fetch:", error);
		return;
	}

	if (updateResponse.ok) {
		const updatedTask = await getTaskById(dataId);
		assertEquals(updateResponse.status, 200);
		assertEquals(updatedTask.title, updateData.get("title"));
		assertEquals(updatedTask.description, updateData.get("description"));
		const expectedDate = new Date(updateData.get("due") as string)
			.toISOString();
		const actualDate = new Date(updatedTask.due).toISOString();
		assertEquals(expectedDate, actualDate);
		assertEquals(updatedTask.status.toString(), updateData.get("status"));
	} else {
		console.error("Failed to update task:", updateResponse.statusText);
	}

	let deleteResponse: Response;
	try {
		deleteResponse = await fetch(taskApiUrl + `/?id=${dataId}`, {
			method: "DELETE",
		});
		await deleteResponse.body?.cancel();
		assertEquals(deleteResponse.status, 200);
		if (deleteResponse.ok) {
			try {
				const fetchDeleted = await fetch(taskApiUrl + `/?id=${dataId}`);
				fetchDeleted.body?.cancel();
				assertEquals(fetchDeleted.status, 404);
			} catch (error) {
				console.error("Error checking for deleted task:", error);
			}
		} else {
			console.error("Failed to delete task:", deleteResponse.statusText);
		}
	} catch (error) {
		console.error("Error deleting task:", error);
	}
});
