<script lang="ts">
import { uiError } from "$lib/stores/ui_error.ts"
function close() {
    uiError.clear();
}
</script>

<#if $uiError>
<div>
</div>
</if>
