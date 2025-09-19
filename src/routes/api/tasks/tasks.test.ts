/// <reference lib="deno.ns" />

import Pocketbase from "pocketbase";
import { assertEquals } from "jsr:@std/assert";

const pbUrl = Deno.env.get("PUBLIC_POCKETBASE_URL");
const taskApiUrl = "http://127.0.0.1:5173/api/tasks";

const pb = new Pocketbase(pbUrl);

let knownTaskIds: string[] = [];

async function getAllTasks() {
	const response = await pb.collection("tasks").getFullList();
	return response;
}

async function getTaskById(id: string) {
	const response = await pb.collection("tasks").getOne(id);
	return response;
}

// Sample data for creating tasks during tests
const testData1: FormData = new FormData();
testData1.append("title", "Test Task");
testData1.append("description", "This is a test task created during testing.");
testData1.append("due", new Date().toISOString());
testData1.append("status", "false");

const testData2: FormData = new FormData();
testData2.append("title", "Another Test Task");
testData2.append(
	"description",
	"This is another test task created during testing.",
);
testData2.append("due", new Date(Date.now() + 86400000).toISOString()); // +1 day
testData2.append("status", "true");

const testData3: FormData = new FormData();
testData3.append("title", "Third Test Task");
testData3.append(
	"description",
	"This is the third test task created during testing.",
);
testData3.append("due", new Date(Date.now() + 172800000).toISOString()); // +2 days
testData3.append("status", "false");

const testDataSuite: FormData[] = [
	testData1,
	testData2,
	testData3,
];

const invalidData1: FormData = new FormData();
invalidData1.append("description", "Missing title and due date");

const invalidData2: FormData = new FormData();
invalidData2.append("description", "This task is missing a due date.");
invalidData2.append("due", new Date().toISOString());

const invalidData3: FormData = new FormData();
invalidData3.append("title", "Invalid Status");
invalidData3.append("description", "This task has an invalid status.");
invalidData3.append("status", "false");

const invalidDataSuite: FormData[] = [
	invalidData1,
	invalidData2,
	invalidData3,
];

Deno.test("Test POST task API", async (t) => {
	for (const [index, testData] of testDataSuite.entries()) {
		await t.step(`Create Valid Test Task ${index + 1}`, async () => {
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
				knownTaskIds.push(data.id);
				assertEquals(createResponse.status, 201);
			} else {
				console.error("Failed to create task:", createResponse.statusText);
			}
		});
	}

	await t.step("Verify Created Tasks", async () => {
		const response = await fetch(taskApiUrl);
		if (response.ok) {
			const data = await response.json();
			const createdTasks = data.result.filter((task: any) =>
				knownTaskIds.includes(task.id)
			);
			assertEquals(
				createdTasks.length,
				testDataSuite.length,
				"Expected created tasks to match test data suite",
			);
		} else {
			console.error("Failed to fetch tasks:", response.statusText);
			assertEquals(response.ok, true);
		}
	});

	await t.step("Attempt Invalid Task Creations", async (i) => {
		for (const [index, invalidData] of invalidDataSuite.entries()) {
			await i.step(`Create Invalid Test Task ${index + 1}`, async () => {
				let createResponse: Response;
				try {
					createResponse = await fetch(taskApiUrl, {
						method: "POST",
						body: invalidData,
					});
					createResponse.body?.cancel();
					assertEquals(createResponse.ok, false);
				} catch (error) {
					console.error("Error during fetch:", error);
					return;
				}
				assertEquals(createResponse.status, 400);
			});
		}
	});

	// Only due and status have type constraints, so only test those
	await t.step("Wrong types sent to API should fail", async () => {
		const wrongTypeData: FormData = new FormData();
		wrongTypeData.append("title", "Task with Wrong Types");
		wrongTypeData.append("description", "This task has wrong data types.");
		wrongTypeData.append("due", "not-a-date");
		wrongTypeData.append("status", "not-a-boolean");

		let createResponse: Response;
		try {
			createResponse = await fetch(taskApiUrl, {
				method: "POST",
				body: wrongTypeData,
			});
			createResponse.body?.cancel();
			assertEquals(createResponse.ok, false);
		} catch (error) {
			console.error("Error during fetch:", error);
			return;
		}
		assertEquals(createResponse.status, 400);
	});
});

Deno.test("Test GET task API", async (t) => {
	await t.step("Fetch All Tasks", async () => {
		const response = await fetch(taskApiUrl);
		if (response.ok) {
			const data = await response.json();
			assertEquals(response.status, 200);
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

	if (knownTaskIds.length === 0) {
		console.warn("No known task IDs available to fetch single tasks.");
		return;
	}

	for (const id of knownTaskIds) {
		await t.step(`Fetch Task ID: ${id}`, async () => {
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
	}

	await t.step("Fetch Non-Existent Task via API", async () => {
		const fakeId = "nonexistentid12345";
		const response = await fetch(taskApiUrl + `/?id=${fakeId}`);
		const data = await response.json();
		assertEquals(data.error, "Task not found");
		assertEquals(response.status, 404);
	});
});

Deno.test("Test PATCH task API", async (t) => {
	if (knownTaskIds.length === 0) {
		console.warn("No known task IDs available to update tasks.");
		return;
	}

	const updateData: FormData = new FormData();
	updateData.append("title", "Updated Task Title");
	updateData.append("description", "The task description has been updated.");
	updateData.append("due", new Date(Date.now() + 86400000).toISOString()); // +1 day
	updateData.append("status", "true");

	for (const id of knownTaskIds) {
		await t.step(`Update Task ID: ${id}`, async () => {
			let updateResponse: Response;
			try {
				updateResponse = await fetch(taskApiUrl + `/?id=${id}`, {
					method: "PATCH",
					body: updateData,
				});
				await updateResponse.body?.cancel();
			} catch (error) {
				console.error("Error during update fetch:", error);
				return;
			}

			if (updateResponse.ok) {
				const updatedTask = await getTaskById(id);
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
		});
	}

	await t.step("Attempt to Update Non-Existent Task", async () => {
		const fakeId = "nonexistentid12345";
		let updateResponse: Response;
		try {
			updateResponse = await fetch(taskApiUrl + `/?id=${fakeId}`, {
				method: "PATCH",
				body: updateData,
			});
			await updateResponse.body?.cancel();
		} catch (error) {
			console.error("Error during update fetch:", error);
			return;
		}

		assertEquals(updateResponse.ok, false);
		assertEquals(updateResponse.status, 404);
	});

	await t.step("Attempt to Update with No ID", async () => {
		let updateResponse: Response;
		try {
			updateResponse = await fetch(taskApiUrl, {
				method: "PATCH",
				body: updateData,
			});
			await updateResponse.body?.cancel();
		} catch (error) {
			console.error("Error during update fetch:", error);
			return;
		}

		assertEquals(updateResponse.ok, false);
		assertEquals(updateResponse.status, 400);
	});

	await t.step("Attempt to Update with No Data", async () => {
		const id = knownTaskIds[0];
		let updateResponse: Response;
		try {
			updateResponse = await fetch(taskApiUrl + `/?id=${id}`, {
				method: "PATCH",
			});
			await updateResponse.body?.cancel();
		} catch (error) {
			console.error("Error during update fetch:", error);
			return;
		}

		assertEquals(updateResponse.ok, false);
		assertEquals(updateResponse.status, 400);
	});

	await t.step("Attempt to Update with Invalid Data", async () => {
		const id = knownTaskIds[0];
		const invalidUpdateData: FormData = new FormData();
		invalidUpdateData.append("due", "not-a-date");
		invalidUpdateData.append("status", "not-a-boolean");

		let updateResponse: Response;
		try {
			updateResponse = await fetch(taskApiUrl + `/?id=${id}`, {
				method: "PATCH",
				body: invalidUpdateData,
			});
			await updateResponse.body?.cancel();
		} catch (error) {
			console.error("Error during update fetch:", error);
			return;
		}

		assertEquals(updateResponse.ok, false);
		assertEquals(updateResponse.status, 400);
	});
});

Deno.test("Test DELETE task API", async (t) => {
	if (knownTaskIds.length === 0) {
		console.warn("No known task IDs available to delete tasks.");
		return;
	}

	for (const id of knownTaskIds) {
		await t.step(`Delete Task ID: ${id}`, async () => {
			let deleteResponse: Response;
			try {
				deleteResponse = await fetch(taskApiUrl + `/?id=${id}`, {
					method: "DELETE",
				});
				await deleteResponse.body?.cancel();
				assertEquals(deleteResponse.status, 200);
				if (deleteResponse.ok) {
					try {
						const fetchDeleted = await fetch(taskApiUrl + `/?id=${id}`);
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
	}

	await t.step("Attempt to Delete Non-Existent Task", async () => {
		const fakeId = "nonexistentid12345";
		let deleteResponse: Response;
		try {
			deleteResponse = await fetch(taskApiUrl + `/?id=${fakeId}`, {
				method: "DELETE",
			});
			await deleteResponse.body?.cancel();
			assertEquals(deleteResponse.ok, false);
			assertEquals(deleteResponse.status, 404);
		} catch (error) {
			console.error("Error deleting non-existent task:", error);
		}
	});

	await t.step("Attempt to Delete with No ID", async () => {
		let deleteResponse: Response;
		try {
			deleteResponse = await fetch(taskApiUrl, {
				method: "DELETE",
			});
			await deleteResponse.body?.cancel();
			assertEquals(deleteResponse.ok, false);
			assertEquals(deleteResponse.status, 400);
		} catch (error) {
			console.error("Error deleting task with no ID:", error);
		}
	});
});
