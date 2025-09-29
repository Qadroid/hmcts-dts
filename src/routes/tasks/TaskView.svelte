<script lang="ts">
	import * as Card from "$components/ui/card/index.ts";
	import Input from "$components/ui/input/input.svelte";
	import Textarea from "$components/ui/textarea/textarea.svelte";
	import Calendar from "$components/ui/calendar/calendar.svelte";
	import { Button } from "$components/ui/button/index.ts";
	import { parseDate } from "@internationalized/date";
	import Checkbox from "$components/ui/checkbox/checkbox.svelte";
	import { enhance } from "$app/forms";
	import toast from "svelte-french-toast";
	import { invalidateAll } from "$app/navigation";

	// Get task data
	let { task } = $props();
	interface Task {
		id: string;
		title: string;
		description: string;
		due: string;
		status: boolean;
	}
	let form: Task = $state(
		{
			id: task.id,
			title: task.title,
			description: task.description,
			due: task.due,
			status: task.status,
		},
	);

	let editMode = $state(false);
	let calendarDate = $derived.by(() => {
		return parseDate(
			form.due ? new Date(form.due).toISOString().split("T")[0] : "",
		);
	});
	let time: string = $state(
		new Date(form.due).toISOString().substring(11, 16),
	);

	$effect(() => {
		if (calendarDate && time) {
			const [hours, minutes] = time.split(":").map(Number);
			const date = new Date(
				calendarDate.year,
				calendarDate.month - 1,
				calendarDate.day,
			);
			const dueDate = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
				hours,
				minutes,
			);
			form.due = dueDate.toISOString();
		}
	});
</script>

<Card.Root class="max-w-1xl m-4">
	<form
		method="POST"
		use:enhance={({ action }) => {
			if (action.toString().endsWith("update")) {
				return async ({ result }) => {
					if (result.type === "success") {
						toast.success("Task updated successfully", { icon: "✅" });
						editMode = false;
						invalidateAll();
					} else {
						toast.error("Error updating task", { icon: "❌" });
						editMode = true;
						invalidateAll();
					}
				};
			} else if (action.toString().endsWith("delete")) {
				return async ({ result }) => {
					if (result.type === "success") {
						toast.success("Task deleted successfully", { icon: "✅" });
						invalidateAll();
					} else {
						toast.error("Error deleting task", { icon: "❌" });
						invalidateAll();
					}
				};
			}
		}}
	>
		<Card.Header class="space-y-2 pb-4">
			<Card.Title>
				<p class="text-xs font-medium text-slate-500 mb-2">Title</p>
				<Input
					type="text"
					bind:value={form.title}
					placeholder="Task Title"
					class="w-full"
					disabled={!editMode}
				/>
			</Card.Title>
			<Card.Description>
				<p class="text-xs font-medium text-slate-500 mb-2">Description</p>
				<Textarea
					bind:value={form.description}
					placeholder="Task Description"
					class="w-full min-h-40"
					disabled={!editMode}
				/>
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col space-y-4 w-[300px]">
			<p class="text-xs font-medium text-slate-500 mb-2">Due Time</p>
			<Input type="time" bind:value={time} disabled={!editMode} />
			<p class="text-xs font-medium text-slate-500 mb-2">Due Date</p>
			<Calendar
				type="single"
				bind:value={calendarDate}
				captionLayout="dropdown"
				disabled={!editMode}
				bind:placeholder={calendarDate}
			/>
			<br />
		</Card.Content>
		<Card.Footer class="flex flex-row space-x-3 items-center ml-3">
			<Button type="button" onclick={() => editMode = !editMode}>
				{editMode ? "Cancel" : "Edit"}
			</Button>
			{#if editMode}
				<Button type="submit" formaction="/tasks?/update">Save</Button>
			{/if}
			<Button type="submit" formaction="/tasks?/delete" variant="destructive"
			>Delete</Button>
			<Checkbox bind:checked={form.status} disabled={!editMode} />
			<span>Completed</span>
		</Card.Footer>
		<Input type="hidden" name="id" value={form.id} />
		<Input type="hidden" name="title" value={form.title} />
		<Input type="hidden" name="description" value={form.description} />
		<Input type="hidden" name="due" value={form.due} />
		<Input type="hidden" name="status" value={form.status} />
	</form>
</Card.Root>
