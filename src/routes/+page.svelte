<script lang="ts">
	import { fade } from 'svelte/transition';
	import axios from 'axios';
	import { connectionServerStore } from '../stores';
	import Alert from '../lib/Alert.svelte';
	import Loading from '../lib/Loading.svelte';

	let isLoading = false;
	let msgLoading = 'Carregando...';
	let isResult = false;
	let msgAlert = '';
	let openAlert = false;
	let originalURL = '';
	let routeURL = '';
	let newURL = '';
	let connectionServer = '';
	connectionServerStore.subscribe((value) => {
		connectionServer = value;
	});
	const timeAlert: number = 2000;
	let setTime: any = '';
	const onCopy = () => {
		openAlert = true;
		msgAlert = 'Copiado!';
		navigator.clipboard.writeText(newURL);
		clearTimeout(setTime);
		setTime = setTimeout(() => {
			openAlert = false;
			msgAlert = '';
		}, timeAlert);
	};
	const validate = () => {
		isResult = false;
		isLoading = true;
		axios
			.post(`${connectionServer}create`, {
				data: {
					originalURL: originalURL,
					route: routeURL
				}
			})
			.then((response: any) => {
				if (response.data.state) {
					isLoading = false;
					isResult = true;
					console.log(response);
					newURL = `${connectionServer}${response.data.data.route}`;
				}
			})
			.catch((error: any) => {
				isLoading = false;
				isResult = false;
				if (error.response.status === 400) {
					openAlert = true;
					msgAlert = error.response.data.error;
					clearTimeout(setTime);
					setTime = setTimeout(() => {
						openAlert = false;
						msgAlert = '';
					}, timeAlert);
					return;
				}
				openAlert = true;
				msgAlert = 'Aconteceu um erro inesperado, tente novamente!';
				clearTimeout(setTime);
				setTime = setTimeout(() => {
					openAlert = false;
					msgAlert = '';
				}, timeAlert);
			});
	};
</script>

<main class="page" transition:fade={{ duration: 200 }}>
	<Alert msg={msgAlert} {openAlert} />
	<Loading {isLoading} {msgLoading} />
	<div class="container-fluid">
		<div class="page__card">
			<h1 class="text-h1">Encurtador de URL</h1>
			<div class="form-input">
				<label for="url-origin">URL original:</label>
				<input
					type="text"
					class="wk-input-text text-left"
					bind:value={originalURL}
					id="url-origin"
					placeholder="URL original..."
				/>
			</div>
			<div class="form-input url-short">
				<label for="url-short">Rota da URL encurtada:</label>
				<div class="flex">
					<input
						type="text"
						class="wk-input-text text-left domain"
						bind:value={connectionServer}
						readonly
					/>
					<input
						type="text"
						class="wk-input-text text-left"
						id="url-short"
						placeholder="Rota..."
						bind:value={routeURL}
					/>
				</div>
			</div>
			<button class="wk-btn btn-anim ripples" on:click={validate}>
				<ion-icon name="refresh-outline" />
				Gerar URL encurtada
			</button>
		</div>
		{#if isResult}
			<div class="page__card result-container" transition:fade={{ duration: 200 }}>
				<h1 class="text-h1">URL encurtada:</h1>
				<div class="container">
					<input type="text" class="wk-input-text text-left domain" bind:value={newURL} readonly />
					<button class="wk-btn ripples-result" on:click={onCopy}>
						<ion-icon name="copy-outline" />
					</button>
				</div>
			</div>
		{/if}
	</div>
</main>

<style lang="scss">
	.wk-input-text {
		background-color: transparent;
		color: rgb(var(--text-color));
		font-size: var(--fs);
		padding: 0.3em;
		width: 100%;
		text-indent: 0.3em;
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
		& .container-fluid {
			margin: auto;
		}
		&__card {
			background-color: var(--bg-card);
			border-radius: var(--brd-radius);
			&:nth-child(1) {
				margin-bottom: 0.5em;
			}
			&:nth-child(2) {
				margin-top: 0.5em;
			}
			& .container {
				width: 100%;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-evenly;
				column-gap: 0.5em;
				& input {
					border: none;
				}
				& button {
					width: 2.5em;
					width: 2.5em;
					background-color: transparent;
					color: rgb(var(--text-color));
					--rp-color: var(--ripple-color);
					--rp-transition: 200;
					--brd-radius: 1em;
				}
			}
			& h1 {
				margin-left: auto;
				margin-right: auto;
				color: rgb(var(--text-color));
			}
			& label {
				font-size: var(--fs);
				color: rgb(var(--text-color));
			}
			width: 95%;
			margin: auto;
			max-width: 500px;
			height: min-content;
			padding: 0.7em;
			border-radius: 1em;
			border: 0.1em solid rgba(var(--text-color), 0.2);
			display: flex;
			align-items: flex-start;
			justify-content: center;
			flex-direction: column;
			row-gap: 0.5em;
			& .form-input {
				width: 100%;
				& .flex {
					display: flex;
					& .domain {
						border: none;
					}
				}
			}
		}
	}
</style>
