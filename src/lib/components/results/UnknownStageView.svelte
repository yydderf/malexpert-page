<script lang="ts">
let {
    result,
    name,
} = $props<{
    result: any;
    name: string;
}>();
</script>

<div class="pb-[25px]">
    {`Unknown Stage ${name}`}
</div>

