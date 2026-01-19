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

export type MetadataLine = { label: string, value: string | number };
export type MetadataLines = MetadataLine[];

