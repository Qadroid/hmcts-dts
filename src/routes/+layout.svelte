<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<div class="h-screen w-screen flex flex-col dark text-slate-200">
	{@render children()}
</div>

<style>
	:global(body) {
		margin: 0;
	}
</style>
