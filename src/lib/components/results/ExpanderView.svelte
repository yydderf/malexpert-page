<script lang="ts">
import { type ExpanderResult } from "$lib/consts/api.ts"
let {
    result,
    name,
} = $props<{
    result: ExpanderResult;
    name: string;
}>();
</script>

<div class="pb-[25px]">
    {name}
</div>


