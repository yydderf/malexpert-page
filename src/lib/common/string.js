export const ShortenMode = Object.freeze({
    PREFIX_ONLY: "prefix",
    PREFIX_SUFFIX: "prefix_suffix",
});

export function shortenName(name, length = 10, mode = ShortenMode.PREFIX_SUFFIX) {
    if (!name || name.length <= 2 * length || length < 1) return name;
    switch (mode) {
        case ShortenMode.PREFIX_ONLY: return name.slice(0, length);
        case ShortenMode.PREFIX_SUFFIX: return name.slice(0, length) + "..." + name.slice(-length);
        default: return name;
    }
}
