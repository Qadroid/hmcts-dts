import type { Actions } from "@sveltejs/kit";
import * as pb from "$lib/pocketbase.ts";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const data = await pb.getTask(event.params.id);
	return { data };
}

export const actions: Actions = {
	update: async (event) => {
		try {
			if (!event.params.id) { return { success: false }; }
			const response = await pb.updateTask(event.params.id, await event.request.formData());
			if (!response.ok) { return { success: false }; }
			redirect(303, "/tasks");
		} catch (error) {
			console.error("Error updating task:", error);
			redirect(303, "/tasks/" + event.params.id);
		}
	},

	delete: async (event) => {
		try {
			if (!event.params.id) { return { success: false }; }
			const response = await pb.deleteTask(event.params.id);
			if (!response) { return { success: false }; }
			redirect(303, "/tasks");
		} catch (error) {
			console.error("Error deleting task:", error);
			redirect(303, "/tasks/" + event.params.id);
		}
	},
}
