# What is this
A basic task management web app that serves a frontend and an API

# Requirements
Deno, NPM, PNPM, Bun, etc. 
Pocketbase
Docker (optional)

# How to Use:
## Docker
The easiest method to get started is to use the included Docker compose file to set up the necessary services. 
The following command should do the the trick if you have Docker installed:
```bash
docker compose up
```
> [!NOTE] 
> If this fails, consider running only Pocketbase with Docker using `/pocketbase/Dockerfile`

## Without Docker
To start the Pocketbase instance, use the binary for your OS and platform linked here: https://pocketbase.io/docs/
Place in `/pocketbase/` and launch using (Change for your system):
```bash
./pocketbase/pocketbase-linux-amd64 serve
```

To run the web-app, do the following:
```bash
deno run build
deno preview
```
The app should be served at: http://localhost:4173
> [!NOTE] 
> In not automatically redirected to `/tasks`, change URL to http://localhost:4173/tasks

# API Documentation
***

## /tasks

### GET /tasks

Fetch all tasks from the PocketBase collection "tasks". Returns the full list as provided by pocketbase.collection("tasks").getFullList().

- Status 200: Array of task records.
- Status 500: { "message": "Failed to fetch tasks" }

Request

- Query params: None.
- Body: None.

Response

- 200 OK: JSON array of task records as returned by PocketBase.
- 500 Internal Server Error: { "message": "Failed to fetch tasks" }

Example

- curl:
    - curl -X GET /tasks

> [!NOTE]
> The handler returns the raw PocketBase list; no pagination is implemented in the route.


### POST /tasks

Create a new task record. The body is parsed from multipart/form-data and validated against taskSchema. On success, the created record from PocketBase is returned.

- Status 201: Newly created record.
- Status 400: { "message": "Invalid task data", "errors": ZodError }
- Status 500: { "message": "Failed to create task" }

Request

- Headers: Content-Type: multipart/form-data.
- Body: Fields matching taskSchema; sent as form fields (Object.fromEntries(await request.formData())).

Response

- 201 Created: JSON of created record from PocketBase create(data).
- 400 Bad Request: Validation failed; includes Zod error details.
- 500 Internal Server Error: { "message": "Failed to create task" }

Example

- curl:
    - curl -X POST /tasks \
-F "title=My task" \
-F "description=Details" \
-F "dueDate=2025-10-01"

> [!NOTE]
> JSON payloads are not supported by this handler; use multipart/form-data.

***

## /tasks/[id]

### GET /tasks/[id]

Fetch a single task by id using PocketBase getOne(id). Returns { response } where response is the record.

- Status 200: { "response": record }
- Status 400: { "message": "Task ID is required" } when id param missing.
- Status 500: { "message": "Failed to fetch task" }

Request

- Path param: id (string).
- Body: None.

Response

- 200 OK: { "response": record }
- 400 Bad Request: Missing id.
- 500 Internal Server Error: { "message": "Failed to fetch task" }

> ![NOTE]
> The payload is wrapped as { response } rather than returning the record directly.


### PATCH /tasks/[id]

Update an existing task. Expects multipart/form-data; the handler appends the route id into the form as "id" and validates with existingTaskSchema before calling PocketBase update(id, data).

- Status 200: { "response": updatedRecord }
- Status 400:
    - { "message": "Task ID is required" } when missing id param.
    - { "message": "Invalid task data", "errors": ZodError } when validation fails.
- Status 500: { "message": "Failed to update task" }

Request

- Headers: Content-Type: multipart/form-data.
- Path param: id (string).
- Body: Fields for update per existingTaskSchema; the handler ensures "id" is present.

Response

- 200 OK: { "response": updatedRecord }
- 400 Bad Request: Missing id or schema validation failure.
- 500 Internal Server Error: { "message": "Failed to update task" }

> [!NOTE]
> If PocketBase returns a falsy response, the handler returns a 500.


#### DELETE /tasks/[id]

Delete a task by id. Validates the id via existingTaskSchema before deletion.

- Status 200: { "response": deletionResult }
- Status 400:
    - { "message": "Task ID is required" } when id is missing.
    - { "message": "Invalid task ID", "errors": ZodError } for invalid id.
- Status 500: { "message": "Failed to delete task" }

Request

- Path param: id (string).
- Body: None.

Response

- 200 OK: { "response": deletionResult } from PocketBase delete(id).
- 400 Bad Request: Missing or invalid id.
- 500 Internal Server Error: { "message": "Failed to delete task" }

***

# Tech Choices
What tech is used to build this and why it was chosen
## Backend/Framework
- Typscript for the main language 
- Deno as package/build manager
- SvelteKit
    - Works well with Svelte (frontend)
    - Great router for pages and other routes
## Frontend
-  Svelte 5
    - Features that enhance developer experience
- TailWindCSS 4
    - Easy utility classes for quick and consistent styling throughout project
- Shadcn-Svelte
    - Recently updated to compatibility with Svelte 5 and TailWindCSS 4
    - Composable UI elements that look good with little configuration
    - Is very customisable
- Svelte French Toast
    - Easy toast messages

# Considerations
## UI/Code Issues
- Some inconsistencies can be found due to incompatibilies and major updates in the framework and libraries used
- Creating and deleting tasks does not correctly refresh loaded data without manual browser refresh
- The frontend does not utilise the API in the backend due to using different implementations
- Not all errors and security issues accounted for
## API Use
- Due to strong validation at certain points, it is possible automated tests may fail
- Included test file can be run using `deno task test`
## Extra
- Zod validation is setup to validate all data whether from API or frontend (This can be overly strict)