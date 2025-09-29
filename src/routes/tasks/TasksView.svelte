<script lang="ts">
	import Separator from "$lib/components/ui/separator/separator.svelte";
	import * as Card from "$lib/components/ui/card/index.ts";
	import { Input } from "$components/ui/input/index.ts";
	import Calendar from "$components/ui/calendar/calendar.svelte";
	import Task from "./TaskView.svelte";
	import * as Dialog from "$lib/components/ui/dialog/index.ts";
	import Button from "$components/ui/button/button.svelte";
	import { parseDate } from "@internationalized/date";
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import toast from "svelte-french-toast";

	let { tasks } = $props();

	const defaultForm = {
		title: "",
		description: "",
		due: "",
		status: false,
	};
	let form = $state({ ...defaultForm });
	let calendarDate = $state(
		parseDate(new Date().toISOString().split("T")[0]),
	);
	let time: string = $state("12:00");

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

<div class="flex flex-col p-16 w-full items-center">
	<Card.Root class="min-w-2xl max-w-2xl">
		<Card.Header>
			<Card.Title>All Tasks</Card.Title>
			<Card.Description>List of tasks with details and status</Card.Description>
			<Card.Action>
				<Dialog.Root>
					<Dialog.Trigger>
						<Button variant="default">
							New Task
						</Button>
					</Dialog.Trigger>
					<Dialog.Content class="dark text-slate-200">
						<Dialog.Header>
							<Dialog.Title>New Task</Dialog.Title>
							<Dialog.Description>Create a new task</Dialog.Description>
						</Dialog.Header>
						<form
							method="POST"
							action="/tasks?/create"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === "success") {
										toast.success("Task created successfully");
										form = { ...defaultForm };
										calendarDate = parseDate(
											new Date().toISOString().split("T")[0],
										);
										time = "12:00";
										goto("/tasks", {
											replaceState: true,
											invalidateAll: true,
										});
									} else {
										toast.error("Error creating task");
										goto("/tasks", {
											replaceState: true,
											invalidateAll: true,
										});
									}
								};
							}}
						>
							<p class="text-xs font-medium text-slate-500 mb-2">Title</p>
							<Input name="title" max={255} bind:value={form.title} required />
							<p class="text-xs font-medium text-slate-500 mb-2">Description</p>
							<Input
								name="description"
								max={255}
								bind:value={form.description}
							/>
							<p class="text-xs font-medium text-slate-500 mb-2">Due Time</p>
							<Input type="time" bind:value={time} required />
							<p class="text-xs font-medium text-slate-500 mb-2">Due Date</p>
							<Calendar
								type="single"
								bind:value={calendarDate}
								captionLayout="dropdown"
								bind:placeholder={calendarDate}
								aria-required
							/>
							<input type="hidden" name="due" bind:value={form.due} />
							<input type="hidden" name="status" value="false" />
							<Button type="submit">Create Task</Button>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			</Card.Action>
		</Card.Header>
		<Separator class="my-2" />
		{#each tasks as task}
			<Card.Content>
				<Task {task} />
			</Card.Content>
		{/each}
	</Card.Root>
</div>
