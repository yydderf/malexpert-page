<script>
    // import favicon from "$lib/assets/favicon.svg";
    import favicon from "$lib/assets/mac.ico";
    import dark_favicon from "$lib/assets/dark_mac.ico";

	let { children } = $props();
    import "../app.css";
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/x-icon" media="(prefers-color-scheme: light)" />
    <link rel="icon" href={dark_favicon} type="image/x-icon" media="(prefers-color-scheme: dark)" />
</svelte:head>

{@render children()}
