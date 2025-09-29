<script lang="ts">
	import { Toaster } from "svelte-french-toast";
	import "../app.css";

	let { children } = $props();
</script>

<div class="h-screen w-screen flex flex-col dark text-slate-200">
	{@render children()}
	<Toaster position="bottom-right" />
</div>

<style>
	:global(body) {
		margin: 0;
	}
</style>
