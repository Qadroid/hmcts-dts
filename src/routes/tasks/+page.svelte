<script lang="ts">
	import TasksView from "./TasksView.svelte";

	let { data } = $props();
	let { tasks } = data;
</script>
<TasksView {tasks} />
