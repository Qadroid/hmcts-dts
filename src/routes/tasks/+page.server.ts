import { redirect, type Actions } from "@sveltejs/kit";
import { pocketbase } from "$lib/pocketbase.ts";
import { superValidate } from "sveltekit-superforms";
import { existingTaskSchema, taskSchema } from "$lib/schemas/TaskSchema.ts";
import { zod4 } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.d.ts";

export const load: PageServerLoad = async () => {
	try {
		const tasks = await pocketbase.collection("tasks").getFullList({
			sort: "-due",
		});
		return { tasks };
	} catch (error) {
		console.error("Error loading tasks:", error);
		return { tasks: [] };
	}
}

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(
			await event.request.formData(),
			zod4(taskSchema),
		);
		if (!form.valid) {
			console.error("Form validation failed:", form.errors);
			return { type: "error", form };
		}
		try {
			const response = await pocketbase.collection("tasks").create(form.data);
			if (!response.ok) return { type: "error", form };
		} catch (error) {
			console.error("Error creating task:", error);
			return { type: "error", form };
		}
		throw redirect(303, '/tasks');
	},

	update: async (event) => {
		const form = await superValidate(
			await event.request.formData(),
			zod4(existingTaskSchema),
		);
		if (!form.valid) {
			console.error("Form validation failed:", form.errors);
			return { form };
		}
		try {
			const response = pocketbase.collection("tasks").update(
				form.data.id,
				form.data,
			);
			if (!response) {
				console.error("Error response from updateTask:", response);
				return { success: false, form };
			}
		} catch (error) {
			console.error("Error updating task:", error);
			return { success: false, form };
		}
		return { type: "success", form: form };
	},

	delete: async (event) => {
		const form = await superValidate(
			await event.request.formData(),
			zod4(existingTaskSchema),
		);
		if (!form.valid) {
			console.error("Form validation failed:", form.errors);
			return { type: "error", form };
		}
		try {
			const response = pocketbase.collection("tasks").delete(form.data.id);
			if (!response) return { type: "error", form };
		} catch (error) {
			console.error("Error deleting task:", error);
			return { type: "error", form };
		}

		return { type: "success", form };
	},
};
