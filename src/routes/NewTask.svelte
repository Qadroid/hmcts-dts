<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import Button from "$components/ui/button/button.svelte";
	import Calendar from "$components/ui/calendar/calendar.svelte";
	import Input from "$components/ui/input/input.svelte";
	import { parseDate } from "@internationalized/date";
	import toast from "svelte-french-toast";

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

<form
	method="POST"
	action="/tasks?/create"
	class="dark"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === "success") {
				toast.success("Task created successfully");
				form = { ...defaultForm };
				calendarDate = parseDate(new Date().toISOString().split("T")[0]);
				time = "12:00";
				goto("/tasks", { replaceState: true, invalidateAll: true });
			} else {
				toast.error("Error creating task");
				goto("/tasks", { replaceState: true, invalidateAll: true });
			}
		};
	}}
>
	<p class="text-xs font-medium text-slate-500 mb-2">Title</p>
	<Input name="title" max={255} bind:value={form.title} required />
	<p class="text-xs font-medium text-slate-500 mb-2">Description</p>
	<Input name="description" max={255} bind:value={form.description} />
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
