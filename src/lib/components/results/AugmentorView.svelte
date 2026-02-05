<script lang="ts">
import { type AugmentorResult } from "$lib/consts/api.ts"
let {
    result,
    name,
} = $props<{
    result: AugmentorResult;
    name: string;
}>();
</script>

<div class="pb-[25px]">
    {name}
</div>

