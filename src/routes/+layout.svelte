<script lang="ts">
	import '../styles/styles.scss';
	import { onMount } from 'svelte';
	import Loading from '../lib/Loading.svelte';
	let isLoading = true;
	let msgLoading = 'Carregando...';
	const cdnImport = [
		'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js',
		'https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js'
	];
	onMount(async () => {
		(await import(cdnImport[0])).default;
		(await import(cdnImport[1])).default;
		isLoading = false;
	});
</script>

<main>
	<Loading {isLoading} {msgLoading} />
</main>
<slot />
