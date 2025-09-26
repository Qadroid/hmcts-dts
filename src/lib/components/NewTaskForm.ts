import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { newTaskSchema } from "$lib/schemas/newTaskSchema.ts";

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(newTaskSchema)),
	};
};

export const actions: Actions = {
	POST: async (event) => {
		console.log("Form submission received");
		const form = await superValidate(event, zod(newTaskSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const formData = form.data;
		const due = formData.due;

		if (due) {
			const [date, time] = due.split("T");
			const [hours, minutes] = time.split(":").map(Number);
			const combinedDateTime = new Date(date);
			combinedDateTime.setHours(hours, minutes, 0, 0);
			formData.due = combinedDateTime.toISOString();
			console.log("Combined DateTime:", formData.due);
		} else if (due) {
			formData.due = new Date(due).toISOString();
		} else {
			return fail(400, { form, error: "Due date is required" });
		}

		const response = await event.fetch("/api/tasks", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		});

		if (!response.ok) {
			console.error("Failed to create task:", response.statusText);
			return fail(500, { form });
		}

		return { form };
	},
};
