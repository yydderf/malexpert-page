<script lang="ts">
import { type DetectorResult } from "$lib/consts/api.ts"
let {
    result,
    name,
} = $props<{
    result: DetectorResult;
    name: string;
}>();
</script>

<div class="pb-[25px]">
    {name}
</div>


