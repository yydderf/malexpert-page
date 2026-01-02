function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

export function typewriter(node, params = {}) {
    let {text = "", speed = 10, start = true, cursor = true, cursorChar = "▍", onDone = null} = params;
    let runId = 0;

    async function run(currentId, t) {
        node.textContent = "";
        for (let i = 0; i < t.length; i++) {
            if (currentId !== runId) return;
            node.textContent += t[i];
            await sleep(speed);
        }

        if (currentId !== runId) return;
        if (typeof onDone === "function") onDone();
    }

    function startRun() {
        runId++;
        const myId = runId;

        if (!start) return;
        
        const t = String(text ?? "");

        run(myId, t);
    }

    startRun();

    return {
        update(next = {}) {
            ({ text = text, speed = speed, start = start, cursor = cursor, cursorChar = cursorChar, onDone = onDone } = next);
            startRun();
        },
        destroy() {
            runId++;
        },
    }
}
