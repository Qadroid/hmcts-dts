import { z } from "zod";

export const taskId = z.object({
	// Taken from PocketBase.
	id: z.string().min(15).max(15).regex(/^[a-z0-9]+$/, "Invalid ID format"),
});

export const taskSchema = z.object({
	title: z.string().min(1, "Title is required").max(
		255,
		"Title must be less than 255 characters",
	),
	description: z.string().max(
		255,
		"Description must be less than 255 characters",
	).optional(),
	due: z.coerce.date().min(new Date(), "Due date must be in the future"),
	status: z.string().transform((val) => val === "true" ? true : false)
		.optional().default(false),
});

export const existingTaskSchema = taskSchema.partial().extend(taskId.shape)
	.required({ id: true });

export type TaskSchema = z.infer<typeof taskSchema>;
export type ExistingTaskSchema = z.infer<typeof existingTaskSchema>;
export type TaskId = z.infer<typeof taskId>;
