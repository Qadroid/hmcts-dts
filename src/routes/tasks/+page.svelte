<script lang="ts">
	import TasksView from "$lib/components/TasksView.svelte";

	let { data } = $props();
	let tasks = data.data;
</script>

<TasksView {tasks} />
