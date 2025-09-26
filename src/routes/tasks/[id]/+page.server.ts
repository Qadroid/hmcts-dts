import type { Actions } from "@sveltejs/kit";
import * as pb from "$lib/pocketbase.ts";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	if (!event.params.id) { redirect(303, "/tasks"); }
	const data = new FormData();
	data.append("id", event.params.id);
	const task = await pb.getTask(data);
	return { task };
}

export const actions: Actions = {
	update: async (event) => {
		try {
			const response = await pb.updateTask(await event.request.formData());
			if (!response.ok) { return { success: false }; }
			redirect(303, "/tasks");
		} catch (error) {
			console.error("Error updating task:", error);
			redirect(303, "/tasks/" + event.params.id);
		}
	},

	delete: async (event) => {
		try {
			const response = await pb.deleteTask(await event.request.formData());
			if (!response) { return { success: false }; }
			redirect(303, "/tasks");
		} catch (error) {
			console.error("Error deleting task:", error);
			redirect(303, "/tasks/" + event.params.id);
		}
	},
}
