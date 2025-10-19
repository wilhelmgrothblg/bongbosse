<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>Bong-Bosse - Låt Bosse fixa bongen!</title>
	<meta name="description" content="Generate optimized Stryktipset rows with real odds, risk profiles, and Monte Carlo simulation" />
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</svelte:head>

<nav class="bg-white shadow-sm border-b">
	<div class="max-w-6xl mx-auto px-4">
		<div class="flex justify-between items-center h-16">
			<div class="flex space-x-8">
				<a href="/" class="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
				 Bong-Bosse
				</a>
				<a href="/system-history" class="text-gray-600 hover:text-gray-900 transition-colors">
					Systemhistorik
				</a>
			</div>
		</div>
	</div>
</nav>

{@render children()}
