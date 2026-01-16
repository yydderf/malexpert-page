<script lang="ts">
let { active } = $props();
</script>

<span class={`rounded-full border px-2 py-1 ${active ? "border-accent text-accent" : "border-accent/40 text-accent/60"}`}>
  <slot />
</span>

