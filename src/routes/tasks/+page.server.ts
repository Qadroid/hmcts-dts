import type { Actions } from "@sveltejs/kit";
import * as pb from "$lib/pocketbase.ts";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const data = await pb.getTasks();
    return { data };
}

export const actions: Actions = {
	create: async (event) => {
		try {
			const response = await pb.createTask(await event.request.formData());
			if (!response.ok) { return { success: false }; }
			redirect(303, "/tasks");
		} catch (error) {
			console.error("Error creating task:", error);
			redirect(303, "/tasks");
		}
	}
};
