<script lang="ts">
	import { zodClient } from "sveltekit-superforms/adapters";
	import * as Form from "$lib/components/ui/form/index";
	import { Input } from "$lib/components/ui/input/index";
	import { Calendar } from "$lib/components/ui/calendar/index";
	import * as Popover from "$lib/components/ui/popover/index";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import { onMount } from "svelte";
	import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
	import {
		type NewTaskSchema,
		newTaskSchema,
	} from "$lib/schemas/TaskSchema";
	import {
		type Infer,
		superForm,
		type SuperValidated,
	} from "sveltekit-superforms";
	import Checkbox from "$components/ui/checkbox/checkbox.svelte";
	import Button from "$components/ui/button/button.svelte";

	let { data }: { data: { form: SuperValidated<Infer<NewTaskSchema>> } } =
		$props();
	let open = $state(false);

	const form = superForm(data.form, {
		validators: zodClient(newTaskSchema),
	});

	const { form: formData, enhance } = form;

	let dueDate: CalendarDate | undefined = $state();
	let dueTime: string | undefined = $state("12:00");

	function dateTimeConvert(date: CalendarDate, time: string): string {
		const [hours, minutes] = time.split(":").map(Number);
		const jsDate = new Date(
			date.year,
			date.month - 1,
			date.day,
			hours,
			minutes,
		);
		return jsDate.toISOString();
	}

	let defaultDate: CalendarDate;

	onMount(() => {
		const now = new Date();
		defaultDate = new CalendarDate(
			now.getFullYear(),
			now.getMonth() + 1,
			now.getDate() + 1,
		);

		formData.due = defaultDate.toDate(getLocalTimeZone()).toISOString();
	});
</script>

<div
	class="flex flex-col w-min-200 pt-50 px-100 text-gray-300 justify-center items-center"
>
	<h1 class="text-2xl font-bold mb-4 flex flex-col">HMCTS Task Manager</h1>
	<h2 class="text-md font-semibold mb-4 flex flex-col">Welcome User!</h2>

	<form method="POST" use:enhance class="w-full max-w-md space-y-4">
		<!-- Title Field -->
		<Form.Field {form} name="title">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Title</Form.Label>
					<Input
						{...props}
						bind:value={$formData.title}
						placeholder="Task title"
					/>
				{/snippet}
			</Form.Control>
		</Form.Field>

		<!-- Description Field -->
		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Description</Form.Label>
					<Input
						{...props}
						bind:value={$formData.description}
						placeholder="Task description"
					/>
				{/snippet}
			</Form.Control>
		</Form.Field>

		<!-- Due Date Field -->
		<div class="flex space-x-4">
			<Popover.Root bind:open>
				<Popover.Trigger>
					<Button
						variant="outline"
						class="w-32 justify-between font-normal"
					>
						{
							dueDate
								? dueDate.toDate(getLocalTimeZone())
									.toLocaleDateString()
								: "Select date"
						}
						<ChevronDownIcon class="ml-2 h-4 w-4" />
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-auto overflow-hidden p-0" align="start">
					<Calendar
						type="single"
						bind:value={dueDate}
						onValueChange={(v) => {
							open = false;
							if (v) {
								formData.due = dateTimeConvert(
									v,
									dueTime ?? "12:00",
								);
							}
						}}
						captionLayout="dropdown"
						class="dark"
					/>
				</Popover.Content>
			</Popover.Root>

			<!-- Due Time Field -->
			<Input
				type="time"
				step="12:00:00"
				bind:value={dueTime}
				onchange={(e) => {
					if (e.target instanceof HTMLInputElement) {
						formData.due = dateTimeConvert(
							dueDate ?? defaultDate,
							e.target.value,
						);
					}
				}}
			/>

			<!-- Hidden Due Field to store ISO string -->
			<Form.Field {form} name="due">
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							class="w-full"
							value={dateTimeConvert(
								dueDate ?? defaultDate,
								dueTime ?? "12:00",
							)}
						/>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</div>

		<!-- Status Field -->
		<Form.Field
			{form}
			name="status"
			class="flex flex-row items-center space-x-3"
		>
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Status</Form.Label>
					<Checkbox {...props} bind:checked={$formData.status} />
				{/snippet}
			</Form.Control>
		</Form.Field>

		<!-- Submit Button -->
		<Form.Button
			class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
		>
			Create Task
		</Form.Button>
	</form>
</div>
