<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.ts";
	import Separator from "$lib/components/ui/separator/separator.svelte";
	import * as Card from "$lib/components/ui/card/index.ts";
    import TaskView from "$lib/components/TaskView.svelte";

	let { tasks } = $props();
</script>

<div class="flex flex-col p-3">
	<Card.Root>
		<Card.Header class="">
			<Card.Title>All Tasks</Card.Title>
			<Card.Description>List of tasks with details and status</Card.Description>
			<Card.Action>
				<Button variant="outline" href="/tasks/?new">New Task</Button>
			</Card.Action>
			<Separator class="my-4" />
		</Card.Header>
		<Card.Content>
			{#each tasks as task}
				<TaskView {task} />
			{/each}
		</Card.Content>
	</Card.Root>
</div>
