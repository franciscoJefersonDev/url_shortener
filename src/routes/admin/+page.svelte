<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import Loading from '../../lib/Loading.svelte';
	import Alert from '../../lib/Alert.svelte';
	import { connectionServerStore } from '../../stores';
	let isLoading = true;
	let isLoaded = true;
	let msgLoading = 'Carregando...';
	let openAlert = false;
	let msgAlert = '';
	let setTime: any = '';
	const timeAlert: number = 2000;
	let urls: any = [];
	let searchURLs: any = [];
	let searchText: string = '';
	let connectionServer = '';
	let isSearch: boolean = true;
	let isError = false;
	let msgError = '';
	$: if (searchText) {
		searchURLs = urls.filter((item: any) => item.route_url.search(searchText) > -1);
	} else {
		searchURLs = urls;
	}
	connectionServerStore.subscribe((value) => {
		connectionServer = value;
	});
	onMount(async () => {
		axios
			.post(`${connectionServer}get`)
			.then((response: any) => {
				isLoading = false;
				urls = response.data.data;
				searchURLs = urls;
			})
			.catch((error: any) => {
				isLoading = false;
				isError = true;
				msgError = 'Não foi posivel buscar as rotas em nossa base de dados tente novamente!';
				console.log(error);
			});
	});
	const edit = (originalURL: string, routeURL: string, id: Number) => {
		isLoading = true;
		axios
			.post(`${connectionServer}update`, {
				data: {
					id,
					originalURL,
					routeURL
				}
			})
			.then((response: any) => {
				isLoading = false;
				urls = response.data.data;
			})
			.catch((error: any) => {
				isLoading = false;
				openAlert = true;
				msgAlert = error.response.data.error;
				clearTimeout(setTime);
				setTime = setTimeout(() => {
					openAlert = false;
					msgAlert = '';
				}, timeAlert);
			});
	};
	const deleteURL = (id: Number) => {
		isLoading = true;
		axios
			.post(`${connectionServer}delete`, {
				id
			})
			.then((response: any) => {
				isLoading = false;
				urls = response.data.data;
			})
			.catch((error: any) => {
				isLoading = false;
				openAlert = true;
				console.log(error);
				msgAlert = error.response.data.error;
				clearTimeout(setTime);
				setTime = setTimeout(() => {
					openAlert = false;
					msgAlert = '';
				}, timeAlert);
			});
	};
	const copyURL = (route: string) => {
		openAlert = true;
		msgAlert = 'Copiado!';
		navigator.clipboard.writeText(`${connectionServer}${route}`);
		clearTimeout(setTime);
		setTime = setTimeout(() => {
			openAlert = false;
			msgAlert = '';
		}, timeAlert);
	};
</script>

<main class="page">
	<Loading {isLoading} {msgLoading} />
	<Alert {openAlert} msg={msgAlert} />
	{#if isLoaded}
		<ul class="page__content">
			<header class="page__content__header">
				<input
					type="text"
					class="wk-input-text text-left"
					id="search-routers"
					bind:value={searchText}
					placeholder="Pesquisar por rotas.."
				/>
				<label class="wk-btn" for="search-routers">
					<ion-icon name="search-outline" />
				</label>
			</header>
			{#if isError}
				<div class="page__content__error">
					{msgError}
					<button
						class={`wk-btn btn-anim ripples-${urls.id}`}
						on:click={() => window.location.reload()}
					>
						<ion-icon name="refresh-outline" />
						Recarregar novamente
					</button>
				</div>
			{/if}
			{#each searchURLs as url}
				<li class="page__content__card" transition:fade={{ duration: 200 }}>
					<div class="container flex-column">
						<label for="originURL">URL Original:</label>
						<input
							type="text"
							class="wk-input-text text-left"
							id="originURL"
							placeholder="URL Original..."
							bind:value={url.original_url}
						/>
					</div>
					<div class="container flex-column">
						<label for="route">Rota: </label>
						<input
							type="text"
							class="wk-input-text text-left"
							id="route"
							placeholder="Rota..."
							bind:value={url.route_url}
						/>
					</div>
					<div class="container buttons">
						<button
							class={`wk-btn btn-anim ripples-${urls.id}`}
							on:click={() => edit(url.original_url, url.route_url, url.id)}
						>
							<ion-icon name="refresh-outline" />
						</button>
						<button class="wk-btn ripples-result" on:click={() => deleteURL(url.id)}>
							<ion-icon name="trash-outline" />
						</button>
						<button class="wk-btn ripples-result" on:click={() => copyURL(url.route_url)}>
							<ion-icon name="copy-outline" />
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style lang="scss">
	.wk-input-text {
		background-color: transparent;
		color: rgb(var(--text-color));
		font-size: var(--fs);
		padding: 0.3em;
		width: 100%;
		--brd-radius: 1em;
		--brd-color: rgba(var(--text-color), 0.2);
		--brd-size: 0.09em;
		--ph-color: rgb(var(--primary));
		--select-color: rgb(var(--primary));
		--select-color-text: rgb(255, 255, 255);
	}
	.wk-btn {
		background-color: rgb(var(--primary));
		color: rgb(255, 255, 255);
		width: 100%;
		padding: 0.3em;
		column-gap: 0.3em;
	}
	.page {
		width: 100%;
		height: 100%;
		background-color: rgb(var(--bg-color));
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 0.3em;
		&__content {
			width: 95%;
			max-width: 500px;
			height: 100%;
			display: flex;
			flex-direction: column;
			row-gap: 0.5em;
			padding: 0;
			overflow-y: auto;
			position: relative;
			border-radius: var(--brd-radius);
			&::-webkit-scrollbar {
				width: 0.4em;
			}
			&::-webkit-scrollbar-thumb {
				background-color: rgb(var(--text-color), 0.3);
				border-radius: var(--brd-radius);
			}
			&::-webkit-scrollbar-thumb:hover {
				background-color: rgb(var(--text-color), 0.5);
			}
			&__header {
				width: 100%;
				position: sticky;
				top: 0;
				left: 0;
				height: 2.5em;
				background-color: var(--bg-card);
				display: flex;
				align-items: center;
				justify-content: center;
				column-gap: 0.3em;
				border: 0.1em solid rgba(var(--text-color), 0.2);
				border-radius: var(--brd-radius);
				z-index: 1000;
				& input {
					width: calc(100% - 50px) !important;
					height: 100% !important;
					border: none !important;
					padding: 0.3em !important;
					text-indent: 0.3em;
				}
				& label {
					width: 50px !important;
					height: 50px !important;
					background-color: transparent !important;
					color: rgb(var(--text-color)) !important;
				}
			}
			&__error {
				width: 100%;
				height: min-content;
				margin: auto;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				text-align: center;
				padding: 0.3em;
				row-gap: 0.3em;
				& button {
					padding: 0.3em;
					width: max-content;
				}
			}
			&__card {
				width: 100%;
				max-width: 500px;
				height: min-content;
				display: flex;
				flex-direction: column;
				row-gap: 0.5em;
				background-color: var(--bg-card);
				border: 0.1em solid rgba(var(--text-color), 0.2);
				border-radius: var(--brd-radius);
				padding: 0.3em;
				& .container {
					width: 100%;
					height: min-content;
					display: flex;
					align-items: flex-start;
					justify-content: flex-start;
					&.flex-column {
						flex-direction: column;
					}
					&.buttons {
						column-gap: 0.3em;
					}
					& label {
						font-size: var(--fs);
						color: rgb(var(--text-color));
					}
				}
			}
		}
	}
</style>
