const BINARY_TYPES = [
    "Executable",
    "Library",
    "Object",
    "Unknown",
] as const;

const BINARY_KINDS = [
    "PE",
    "Elf",
    "Mach",
    "Unknown",
] as const;

type BinaryType = (typeof BINARY_TYPES)[number];
type BinaryKind = (typeof BINARY_KINDS)[number];

export type MetaJson = {
    size: number;
    hash: string;
    entropy: number;
    arch: BinaryKind;
    bitness: number;
    endianness: "Little" | "Big";
    exec_type: BinaryType;
};

export type MetadataLine = { label: string, value: string | number, help?: string | null };
export type MetadataLines = MetadataLine[];

export const HELP_MSG = {
    HASH: `Hash:

a cryptographic fingerprint of the binary, security tools (like antivirus softwares) use this to quickly distinguish whether the binary has been seen before.

(lack of robustness - a small change in the binary will lead to a completely different hash value)
`,
    ENTROPY: (entropy: number): string =>
        `Entropy:

Indicating the randomness of the data \
(value that is higher than 6.5 suggests packed/encrypted data, while lower values suggest normal code).

the current value: ${entropy} indicating this sample ${entropy >= 6.5 ? "might be packed/encrypted" : "might be a normal binary"}`,
} as const;
