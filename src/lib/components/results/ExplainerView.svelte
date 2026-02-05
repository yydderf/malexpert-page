<script lang="ts">
import { type ExplainerResult } from "$lib/consts/api.ts"
let {
    result,
    name,
} = $props<{
    result: ExplainerResult;
    name: string;
}>();
</script>

<div class="pb-[25px]">
    {name}
</div>


