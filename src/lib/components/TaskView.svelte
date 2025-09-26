<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.ts";
	import { Input } from "$lib/components/ui/input/index.ts";
	import { Textarea } from "$lib/components/ui/textarea/index.ts";
    import { Label } from "$lib/components/ui/label/index.ts";
	import Calendar from "./ui/calendar/calendar.svelte";
	import * as Popover from "$lib/components/ui/popover/index.ts";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import {
  CalendarDate,
		getLocalTimeZone,
	} from "@internationalized/date";

	let editMode = $state(false);
	let open = $state(false);
	let { task } = $props();
    let value = $state<CalendarDate | undefined>();
    
</script>

<div>
	<form
		method="POST"
		action="/tasks/{task.id}?/update"
		class="flex flex-col p-4 space-y-4"
	>
		<Input value={task.title} disabled={!editMode} class="mb-4" />
		<Textarea value={task.description} disabled={!editMode} class="mb-4" />
		<div class="flex gap-4">
			<div class="flex flex-col gap-3">
				<Label for="{task.id}-date" class="px-1">Date</Label>
				<Popover.Root bind:open>
					<Popover.Trigger id="{task.id}-date">
						{#snippet child({ props })}
							<Button
								{...props}
								variant="outline"
								class="w-32 justify-between font-normal"
							>
								{
									value
										? value.toDate(getLocalTimeZone()).toLocaleDateString()
										: "Select date"
								}
								<ChevronDownIcon />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-auto overflow-hidden p-0" align="start">
						<Calendar
							type="single"
							bind:value={value}
                            disabled={!editMode}
							onValueChange={() => {
								open = false;
							}}
							captionLayout="dropdown"
						/>
					</Popover.Content>
				</Popover.Root>
			</div>
			<div class="flex flex-col gap-3">
				<Label for="{task.id}-time" class="px-1">Time</Label>
				<Input
					type="time"
					id="{task.id}-time"
					step="1"
					value="10:30:00"
					class="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
				/>
			</div>
		</div>
		<Input value={task.status} disabled={!editMode} class="mb-4" />
		{#if editMode}
			<Button type="submit" variant="default">Save</Button>
		{/if}
	</form>
</div>
