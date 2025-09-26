<script lang="ts">
	let { task } = $props();
</script>
{#if task}
	<h1 class="text-2xl font-bold mb-4">{task.title}</h1>
	<p class="mb-2">{task.description}</p>
	<p class="mb-2">Due: {new Date(task.due).toLocaleString()}</p>
	<p class="mb-2">Status: {task.status ? "Completed" : "Pending"}</p>
	<form method="POST" action="?/update">
		<input type="hidden" name="status" value={!task.status} />
		<button type="submit" class="mr-2">
			{task.status ? "Mark as Pending" : "Mark as Completed"}
		</button>
	</form>
	<form method="POST" action="?/delete">
		<button type="submit" class="text-red-600">Delete</button>
	</form>
{:else}
	<p>Task not found.</p>
{/if}
