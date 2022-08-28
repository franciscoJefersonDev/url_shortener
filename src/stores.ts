import { writable } from "svelte/store";

export let connectionServerStore = writable('http://localhost:3000/');