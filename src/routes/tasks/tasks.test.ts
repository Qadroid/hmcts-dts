/// <reference lib="deno.ns" />

import PocketBase from "pocketbase";
import { assertEquals, assert } from "jsr:@std/assert";

const pbUrl = Deno.env.get("PUBLIC_POCKETBASE_URL");
const baseUrl = "http://localhost:5173/tasks";
const pb = new PocketBase(pbUrl);

const knownTaskIds: string[] = [];

// Helpers
function fd(data: Record<string, string>) {
  const form = new FormData();
  for (const [k, v] of Object.entries(data)) form.append(k, v);
  return form;
}

const validSuite: FormData[] = [
  fd({
    title: "Test Task",
    description: "This is a test task created during testing.",
    due: new Date().toISOString(),
    status: "false",
  }),
  fd({
    title: "Another Test Task",
    description: "This is another test task created during testing.",
    due: new Date(Date.now() + 86400000).toISOString(),
    status: "true",
  }),
  fd({
    title: "Third Test Task",
    description: "This is the third test task created during testing.",
    due: new Date(Date.now() + 172800000).toISOString(),
    status: "false",
  }),
];

const invalidCreateSuite: FormData[] = [
  fd({ description: "Missing title and due date" }),
  fd({ description: "Missing title", due: new Date().toISOString() }),
  fd({ title: "Missing due date", description: "Missing due date" }),
];

Deno.test("Tasks API - POST create tasks (201) and capture ids", async (t) => {
  for (const [i, form] of validSuite.entries()) {
    await t.step(`Create valid ${i + 1}`, async () => {
      const res = await fetch(baseUrl, { method: "POST", body: form });
      assertEquals(res.status, 201);
      const record = await res.json();
      assert("id" in record);
      knownTaskIds.push(record.id);
    });
  }
});

Deno.test("Tasks API - GET list (200) returns array and includes created ids", async () => {
  const res = await fetch(baseUrl);
  assertEquals(res.status, 200);
  const list = await res.json();
  assert(Array.isArray(list));
  const gotIds = new Set(list.map((r: any) => r.id));
  for (const id of knownTaskIds) assert(gotIds.has(id));
});

Deno.test("Tasks API - GET by id (200) returns { response } shape and matches PB", async (t) => {
  for (const id of knownTaskIds) {
    await t.step(`GET /tasks/${id}`, async () => {
      const res = await fetch(`${baseUrl}/${id}`);
      assertEquals(res.status, 200);
      const json = await res.json();
      assert("response" in json);
      assertEquals(json.response.id, id);
      const pbRecord = await pb.collection("tasks").getOne(id);
      assertEquals(pbRecord.id, json.response.id);
      assertEquals(pbRecord.title, json.response.title);
    });
  }
});

Deno.test("Tasks API - GET non-existent id returns 500 with failure message", async () => {
  const fakeId = "nonexistentid12345";
  const res = await fetch(`${baseUrl}/${fakeId}`);
  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.message, "Failed to fetch task");
});

Deno.test("Tasks API - POST invalid data returns 400", async (t) => {
  for (const [i, form] of invalidCreateSuite.entries()) {
    await t.step(`Invalid create ${i + 1}`, async () => {
      const res = await fetch(baseUrl, { method: "POST", body: form });
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(body.message, "Invalid task data");
      assert("errors" in body);
    });
  }
});

Deno.test("Tasks API - POST wrong types returns 400", async () => {
  const wrongTypes = fd({
    title: "Wrong Types",
    description: "due and status are wrong types",
    due: "not-a-date",
    status: "not-a-boolean",
  });
  const res = await fetch(baseUrl, { method: "POST", body: wrongTypes });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.message, "Invalid task data");
  assert("errors" in body);
});

Deno.test("Tasks API - PATCH update by id (200) and persisted in PB", async () => {
  const id = knownTaskIds[0];
  const updateForm = fd({
    title: "Updated Task Title",
    description: "The task description has been updated.",
    due: new Date(Date.now() + 86400000).toISOString(),
    status: "true",
  });
  const res = await fetch(`${baseUrl}/${id}`, { method: "PATCH", body: updateForm });
  res.body?.cancel();
  assertEquals(res.status, 200);
  const pbRecord = await pb.collection("tasks").getOne(id);
  assertEquals(pbRecord.title, "Updated Task Title");
  assertEquals(pbRecord.description, "The task description has been updated.");
  assertEquals(new Date(pbRecord.due).toISOString(), new Date(updateForm.get("due") as string).toISOString());
  assertEquals(String(pbRecord.status), "true");
});

Deno.test("Tasks API - PATCH invalid types returns 400", async () => {
  const id = knownTaskIds[0];
  const invalidUpdate = fd({
    due: "not-a-date",
    status: "not-a-boolean",
  });
  const res = await fetch(`${baseUrl}/${id}`, { method: "PATCH", body: invalidUpdate });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.message, "Invalid task data");
  assert("errors" in body);
});

Deno.test("Tasks API - DELETE by id (200) then subsequent GET returns 500", async (t) => {
  for (const id of [...knownTaskIds]) {
    await t.step(`DELETE /tasks/${id}`, async () => {
      const delRes = await fetch(`${baseUrl}/${id}`, { method: "DELETE" });
      delRes.body?.cancel();
      assertEquals(delRes.status, 200);
      const getRes = await fetch(`${baseUrl}/${id}`);
      assertEquals(getRes.status, 500);
      const body = await getRes.json();
      assertEquals(body.message, "Failed to fetch task");
    });
  }
});

Deno.test("Tasks API - DELETE non-existent id returns 400", async () => {
  const fakeId = "nonExistId12345";
  const res = await fetch(`${baseUrl}/${fakeId}`, { method: "DELETE" });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.message, "Invalid task ID");
});

Deno.test("Tasks API - DELETE on /tasks (no id) is 405 (no route handler)", async () => {
  const res = await fetch(baseUrl, { method: "DELETE" });
  res.body?.cancel();
  assertEquals(res.status, 405);
});
