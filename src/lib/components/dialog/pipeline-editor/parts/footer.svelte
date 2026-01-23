<script lang="ts">
import Plus from "phosphor-svelte/lib/Plus";
import Minus from "phosphor-svelte/lib/Minus";
import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";

import TipButton from "./tip-button.svelte";
</script>

<footer class="border-t border-accent dark:border-dark-accent">
    <div class="flex flex-col items-center gap-2 pt-2">
        <div class="flex flex-wrap w-full justify-center items-center gap-2">
            <TipButton buttonTitle=""
                buttonDescription="cancel and go back"
                tipside="bottom"
            >
                {#snippet triggerIcon()}
                    <ArrowLeft />
                {/snippet}
            </TipButton>
            <span class="opcaity-40 px-1 select-none hidden sm:inline">::</span>
            <TipButton buttonTitle=""
                buttonDescription="clear the selection"
                tipside="bottom"
            >
                {#snippet triggerIcon()}
                    <Minus />
                {/snippet}
            </TipButton>
            <span class="opcaity-40 px-1 select-none hidden sm:inline">::</span>
            <TipButton buttonTitle=""
                buttonDescription="save the configuration"
                tipside="bottom"
            >
                {#snippet triggerIcon()}
                    <Plus />
                {/snippet}
            </TipButton>
        </div>
    </div>
</footer>
