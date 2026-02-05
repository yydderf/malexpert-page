<script lang="ts">
import { type EncoderResult } from "$lib/consts/api.ts"
let {
    result,
    name,
} = $props<{
    result: EncoderResult;
    name: string;
}>();
</script>

<div class="pb-[25px]">
    {name}
</div>


