// news-image-20261126 — entry for make.fun
// Draws a 1024x1024 newspaper front page summing up the world news of
// Thursday 26 November 2026 and writes it to /output/entry.png.
// Node 22, standard library only. No network. Deterministic: the same
// input always produces the same bytes, so two runs write identical files.
// The text is drawn with a 1-bit bitmap font (DejaVu Sans Bold, 18px,
// rendered to bits) embedded below as FONT: each glyph is its width and
// 22 rows of hex-packed bits, top row first, baseline near row 17.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1024;
const H = 1024;
const FONT_H = 22;
type Glyph = { w: number; rows: string[] };
const FONT: Record<string, Glyph> = {
" ": { "w": 6, "rows": [] },
"!": { "w": 4, "rows": ["0", "0", "0", "0", "f", "f", "f", "f", "f", "f", "f", "f", "f", "0", "f", "f", "f", "0", "0", "0", "0", "0"] },
"\"": { "w": 7, "rows": ["00", "00", "00", "00", "77", "77", "77", "77", "77", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"] },
"#": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "01ce", "01de", "01dc", "01dc", "0fff", "0fff", "03b8", "03b8", "1ffe", "1ffe", "0770", "0770", "0f70", "0000", "0000", "0000", "0000", "0000"] },
"$": { "w": 11, "rows": ["000", "000", "000", "060", "060", "3fe", "7fe", "7fe", "7e0", "7f0", "7fe", "3fe", "0ff", "06f", "7ff", "7fe", "7fe", "060", "060", "060", "000", "000"] },
"%": { "w": 18, "rows": ["00000", "00000", "00000", "00000", "1f878", "3fcf0", "39ce0", "39de0", "39dc0", "3ff80", "1fffe", "007ff", "00ee7", "01ee7", "01ce7", "03cff", "0387e", "00000", "00000", "00000", "00000", "00000"] },
"&": { "w": 14, "rows": ["0000", "0000", "0000", "0000", "07f0", "0ff0", "0ff0", "0f00", "0f80", "1fcf", "3fef", "3ffe", "3dfe", "3cfe", "3ffe", "3ffe", "1fff", "0000", "0000", "0000", "0000", "0000"] },
"'": { "w": 3, "rows": ["0", "0", "0", "0", "7", "7", "7", "7", "7", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"] },
"(": { "w": 6, "rows": ["00", "00", "00", "0f", "0f", "1e", "1e", "1e", "3c", "3c", "3c", "3c", "3c", "3c", "1e", "1e", "1e", "0f", "0f", "00", "00", "00"] },
")": { "w": 6, "rows": ["00", "00", "00", "3c", "3e", "1e", "1e", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "1e", "1e", "3e", "3c", "00", "00", "00"] },
"*": { "w": 9, "rows": ["000", "000", "000", "000", "038", "1ff", "1ff", "0fe", "0fe", "1ff", "1ff", "038", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000"] },
"+": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "0000", "00e0", "00e0", "00e0", "00e0", "00e0", "1fff", "1fff", "00e0", "00e0", "00e0", "00e0", "00e0", "0000", "0000", "0000", "0000", "0000"] },
",": { "w": 5, "rows": ["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "0f", "0f", "0f", "0f", "0f", "1e", "00", "00"] },
"-": { "w": 7, "rows": ["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "7f", "7f", "7f", "00", "00", "00", "00", "00", "00", "00", "00", "00"] },
".": { "w": 4, "rows": ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "f", "f", "f", "0", "0", "0", "0", "0"] },
"/": { "w": 7, "rows": ["00", "00", "00", "00", "07", "07", "0e", "0e", "0e", "1c", "1c", "1c", "3c", "38", "38", "78", "70", "70", "70", "00", "00", "00"] },
"0": { "w": 12, "rows": ["000", "000", "000", "000", "1fc", "3fe", "7fe", "79f", "f8f", "f8f", "f8f", "f8f", "f8f", "79f", "7fe", "3fe", "1fc", "000", "000", "000", "000", "000"] },
"1": { "w": 10, "rows": ["000", "000", "000", "000", "3f8", "3f8", "3f8", "078", "078", "078", "078", "078", "078", "078", "078", "3ff", "3ff", "000", "000", "000", "000", "000"] },
"2": { "w": 10, "rows": ["000", "000", "000", "000", "3fe", "3ff", "3ff", "30f", "00f", "01f", "01f", "03e", "0fc", "1f8", "3f0", "3ff", "3ff", "000", "000", "000", "000", "000"] },
"3": { "w": 11, "rows": ["000", "000", "000", "000", "7fc", "7fe", "7fe", "01e", "07e", "1fc", "1fe", "07e", "01f", "01f", "7fe", "7fe", "7fc", "000", "000", "000", "000", "000"] },
"4": { "w": 12, "rows": ["000", "000", "000", "000", "07c", "0fc", "1fc", "1fc", "3fc", "7bc", "7bc", "f3c", "fff", "fff", "03c", "03c", "03c", "000", "000", "000", "000", "000"] },
"5": { "w": 11, "rows": ["000", "000", "000", "000", "7fe", "7fe", "780", "780", "7fc", "7fe", "7fe", "01f", "01f", "01f", "7fe", "7fe", "7fc", "000", "000", "000", "000", "000"] },
"6": { "w": 11, "rows": ["000", "000", "000", "000", "1fe", "3fe", "7fe", "7c0", "7fc", "7fe", "7ff", "78f", "78f", "78f", "7ff", "3fe", "1fc", "000", "000", "000", "000", "000"] },
"7": { "w": 11, "rows": ["000", "000", "000", "000", "7ff", "7ff", "01e", "03e", "03e", "07c", "07c", "0f8", "0f8", "0f0", "1f0", "1e0", "3e0", "000", "000", "000", "000", "000"] },
"8": { "w": 11, "rows": ["000", "000", "000", "000", "3fe", "7fe", "7ff", "79f", "7fe", "3fe", "3fe", "7ff", "78f", "78f", "7ff", "7fe", "3fe", "000", "000", "000", "000", "000"] },
"9": { "w": 12, "rows": ["000", "000", "000", "000", "3fc", "7fe", "7fe", "79f", "f9f", "f9f", "7ff", "7ff", "3ff", "01e", "7fe", "7fc", "7f8", "000", "000", "000", "000", "000"] },
":": { "w": 4, "rows": ["0", "0", "0", "0", "0", "0", "0", "f", "f", "f", "0", "0", "0", "0", "f", "f", "f", "0", "0", "0", "0", "0"] },
";": { "w": 5, "rows": ["00", "00", "00", "00", "00", "00", "00", "0f", "0f", "0f", "00", "00", "00", "00", "0f", "0f", "1f", "1e", "1e", "1c", "00", "00"] },
"<": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "0000", "0000", "000f", "007f", "03ff", "0ff8", "1fc0", "1fc0", "0ff8", "03ff", "007f", "000f", "0000", "0000", "0000", "0000", "0000", "0000"] },
"=": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "1fff", "1fff", "0000", "0000", "1fff", "1fff", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000"] },
">": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "0000", "0000", "1e00", "1fc0", "1ff8", "03ff", "007f", "007f", "03ff", "1ff8", "1fc0", "1e00", "0000", "0000", "0000", "0000", "0000", "0000"] },
"?": { "w": 9, "rows": ["000", "000", "000", "000", "1fe", "1fe", "1ff", "01f", "01f", "03e", "07c", "078", "078", "000", "078", "078", "078", "000", "000", "000", "000", "000"] },
"@": { "w": 16, "rows": ["0000", "0000", "0000", "0000", "0ff0", "3ffc", "3ffe", "781e", "f7f7", "eff7", "eff3", "ce77", "ce77", "efff", "effe", "f7fc", "7818", "7ffc", "3ff8", "0ff0", "0000", "0000"] },
"A": { "w": 14, "rows": ["0000", "0000", "0000", "0000", "03f0", "03f0", "07f8", "07f8", "07f8", "0ffc", "0f3c", "0f3c", "1ffe", "1ffe", "3e1f", "3c1f", "3c0f", "0000", "0000", "0000", "0000", "0000"] },
"B": { "w": 12, "rows": ["000", "000", "000", "000", "ffc", "ffe", "fbe", "f9e", "fbe", "ffe", "ffe", "fbf", "f9f", "f9f", "fbf", "ffe", "ffe", "000", "000", "000", "000", "000"] },
"C": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "03ff", "07ff", "0fff", "0f80", "0f00", "1f00", "1f00", "1f00", "0f00", "0f80", "0fff", "07ff", "03ff", "0000", "0000", "0000", "0000", "0000"] },
"D": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "1ff8", "1ffe", "1fff", "1f1f", "1f0f", "1f0f", "1f0f", "1f0f", "1f0f", "1f1f", "1fff", "1ffe", "1ff8", "0000", "0000", "0000", "0000", "0000"] },
"E": { "w": 10, "rows": ["000", "000", "000", "000", "3ff", "3ff", "3e0", "3e0", "3e0", "3ff", "3ff", "3e0", "3e0", "3e0", "3e0", "3ff", "3ff", "000", "000", "000", "000", "000"] },
"F": { "w": 10, "rows": ["000", "000", "000", "000", "3ff", "3ff", "3e0", "3e0", "3e0", "3ff", "3ff", "3e0", "3e0", "3e0", "3e0", "3e0", "3e0", "000", "000", "000", "000", "000"] },
"G": { "w": 14, "rows": ["0000", "0000", "0000", "0000", "07fe", "0ffe", "1ffe", "1f00", "1e00", "3e00", "3e3f", "3e3f", "1e0f", "1f0f", "1fff", "0fff", "07ff", "0000", "0000", "0000", "0000", "0000"] },
"H": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "1f0f", "1f0f", "1f0f", "1f0f", "1f0f", "1fff", "1fff", "1f0f", "1f0f", "1f0f", "1f0f", "1f0f", "1f0f", "0000", "0000", "0000", "0000", "0000"] },
"I": { "w": 5, "rows": ["00", "00", "00", "00", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "00", "00", "00", "00", "00"] },
"J": { "w": 8, "rows": ["00", "00", "00", "00", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1f", "1e", "7e", "fe", "fc", "00"] },
"K": { "w": 14, "rows": ["0000", "0000", "0000", "0000", "3e7e", "3efc", "3ff8", "3ff0", "3fe0", "3fc0", "3fc0", "3fe0", "3ff0", "3ff8", "3efc", "3e7e", "3e3f", "0000", "0000", "0000", "0000", "0000"] },
"L": { "w": 10, "rows": ["000", "000", "000", "000", "3e0", "3e0", "3e0", "3e0", "3e0", "3e0", "3e0", "3e0", "3e0", "3e0", "3e0", "3ff", "3ff", "000", "000", "000", "000", "000"] },
"M": { "w": 16, "rows": ["0000", "0000", "0000", "0000", "fc3f", "fc3f", "fe7f", "fe7f", "ffff", "ffff", "f7ef", "f7ef", "f3cf", "f3cf", "f00f", "f00f", "f00f", "0000", "0000", "0000", "0000", "0000"] },
"N": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "1f0f", "1f8f", "1f8f", "1fcf", "1fef", "1fef", "1fff", "1eff", "1e7f", "1e7f", "1e3f", "1e3f", "1e1f", "0000", "0000", "0000", "0000", "0000"] },
"O": { "w": 15, "rows": ["0000", "0000", "0000", "0000", "0ff8", "1ffc", "3ffe", "3e3e", "3c1f", "7c1f", "7c1f", "7c1f", "3c1f", "3e3e", "3ffe", "1ffc", "0ff8", "0000", "0000", "0000", "0000", "0000"] },
"P": { "w": 12, "rows": ["000", "000", "000", "000", "ffc", "ffe", "fbf", "f9f", "f9f", "f9f", "fbf", "ffe", "ffc", "f80", "f80", "f80", "f80", "000", "000", "000", "000", "000"] },
"Q": { "w": 15, "rows": ["0000", "0000", "0000", "0000", "0ff8", "1ffc", "3ffe", "3e3e", "3c1f", "7c1f", "7c1f", "7c1f", "3c1f", "3e3e", "3ffe", "1ffc", "0ff8", "0078", "007c", "003e", "0000", "0000"] },
"R": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "1ff8", "1ffc", "1ffc", "1f3c", "1f3c", "1ffc", "1ff8", "1ff8", "1ffc", "1f7c", "1f3e", "1f3e", "1f1f", "0000", "0000", "0000", "0000", "0000"] },
"S": { "w": 11, "rows": ["000", "000", "000", "000", "3fe", "7fe", "7fe", "780", "7e0", "7fc", "7fe", "3ff", "07f", "00f", "7ff", "7ff", "7fe", "000", "000", "000", "000", "000"] },
"T": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "1fff", "1fff", "01e0", "01e0", "01e0", "01e0", "01e0", "01e0", "01e0", "01e0", "01e0", "01e0", "01e0", "0000", "0000", "0000", "0000", "0000"] },
"U": { "w": 12, "rows": ["000", "000", "000", "000", "f8f", "f8f", "f8f", "f8f", "f8f", "f8f", "f8f", "f8f", "f8f", "f8f", "7ff", "7ff", "3fe", "000", "000", "000", "000", "000"] },
"V": { "w": 14, "rows": ["0000", "0000", "0000", "0000", "3c0f", "3e1f", "3e1f", "1e1e", "1f3e", "0f3c", "0f7c", "0ffc", "07f8", "07f8", "07f8", "03f0", "03f0", "0000", "0000", "0000", "0000", "0000"] },
"W": { "w": 20, "rows": ["00000", "00000", "00000", "00000", "f0f1f", "f9f1f", "79f9e", "79f9e", "79fbe", "7ffbe", "3fffc", "3fbfc", "3f9fc", "3f9fc", "3f9f8", "1f1f8", "1f0f8", "00000", "00000", "00000", "00000", "00000"] },
"X": { "w": 14, "rows": ["0000", "0000", "0000", "0000", "3e1f", "1f3e", "1ffc", "0ffc", "07f8", "03f0", "03f0", "07f8", "07f8", "0ffc", "1f7e", "1f3e", "3e1f", "0000", "0000", "0000", "0000", "0000"] },
"Y": { "w": 15, "rows": ["0000", "0000", "0000", "0000", "7e3f", "3e3e", "1f7c", "1ffc", "0ff8", "07f0", "07f0", "03e0", "03e0", "03e0", "03e0", "03e0", "03e0", "0000", "0000", "0000", "0000", "0000"] },
"Z": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "0fff", "0fff", "003f", "007e", "00fc", "01f8", "03f0", "03f0", "07e0", "0fc0", "1f80", "1fff", "1fff", "0000", "0000", "0000", "0000", "0000"] },
"[": { "w": 6, "rows": ["00", "00", "00", "3f", "3f", "3c", "3c", "3c", "3c", "3c", "3c", "3c", "3c", "3c", "3c", "3c", "3c", "3f", "3f", "00", "00", "00"] },
"\\": { "w": 7, "rows": ["00", "00", "00", "00", "70", "70", "70", "78", "38", "38", "3c", "1c", "1c", "1c", "0e", "0e", "0e", "07", "07", "00", "00", "00"] },
"]": { "w": 6, "rows": ["00", "00", "00", "3f", "3f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "3f", "3f", "00", "00", "00"] },
"^": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "01f0", "03f8", "07fc", "0fbe", "1f1f", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000"] },
"_": { "w": 9, "rows": ["000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "000", "1ff", "1ff", "000"] },
"`": { "w": 6, "rows": ["00", "00", "00", "3e", "0e", "07", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"] },
"a": { "w": 11, "rows": ["000", "000", "000", "000", "000", "000", "000", "3fe", "3ff", "03f", "00f", "3ff", "3ff", "7ef", "7ff", "3ff", "3ff", "000", "000", "000", "000", "000"] },
"b": { "w": 12, "rows": ["000", "000", "000", "f00", "f00", "f00", "f00", "ffc", "ffe", "ffe", "f9e", "f1f", "f1f", "f9e", "ffe", "ffe", "ffc", "000", "000", "000", "000", "000"] },
"c": { "w": 10, "rows": ["000", "000", "000", "000", "000", "000", "000", "0ff", "1ff", "1ff", "3e0", "3e0", "3e0", "3e0", "1ff", "1ff", "0ff", "000", "000", "000", "000", "000"] },
"d": { "w": 12, "rows": ["000", "000", "000", "00f", "00f", "00f", "00f", "3ff", "7ff", "7ff", "f9f", "f8f", "f8f", "f9f", "7ff", "7ff", "3ff", "000", "000", "000", "000", "000"] },
"e": { "w": 12, "rows": ["000", "000", "000", "000", "000", "000", "000", "3fc", "7fe", "7fe", "f9f", "fff", "fff", "f80", "7fe", "7fe", "3fe", "000", "000", "000", "000", "000"] },
"f": { "w": 8, "rows": ["00", "00", "00", "3f", "3f", "7c", "7c", "ff", "ff", "7c", "7c", "7c", "7c", "7c", "7c", "7c", "7c", "00", "00", "00", "00", "00"] },
"g": { "w": 12, "rows": ["000", "000", "000", "000", "000", "000", "000", "3ff", "7ff", "7ff", "f9f", "f8f", "f8f", "f9f", "7ff", "7ff", "3ff", "01f", "3fe", "3fe", "3fc", "000"] },
"h": { "w": 11, "rows": ["000", "000", "000", "780", "780", "780", "780", "7fe", "7ff", "7ff", "7cf", "78f", "78f", "78f", "78f", "78f", "78f", "000", "000", "000", "000", "000"] },
"i": { "w": 4, "rows": ["0", "0", "0", "f", "f", "f", "0", "f", "f", "f", "f", "f", "f", "f", "f", "f", "f", "0", "0", "0", "0", "0"] },
"j": { "w": 6, "rows": ["00", "00", "00", "0f", "0f", "0f", "00", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "0f", "1f", "3f", "3e", "00"] },
"k": { "w": 12, "rows": ["000", "000", "000", "f00", "f00", "f00", "f00", "f3e", "f7c", "ff8", "ff0", "fe0", "ff0", "ff8", "ffc", "f7e", "f3f", "000", "000", "000", "000", "000"] },
"l": { "w": 4, "rows": ["0", "0", "0", "f", "f", "f", "f", "f", "f", "f", "f", "f", "f", "f", "f", "f", "f", "0", "0", "0", "0", "0"] },
"m": { "w": 17, "rows": ["00000", "00000", "00000", "00000", "00000", "00000", "00000", "1ff7e", "1fffe", "1ffff", "1e7cf", "1e7cf", "1e78f", "1e78f", "1e78f", "1e78f", "1e78f", "00000", "00000", "00000", "00000", "00000"] },
"n": { "w": 11, "rows": ["000", "000", "000", "000", "000", "000", "000", "7fe", "7ff", "7ff", "7cf", "78f", "78f", "78f", "78f", "78f", "78f", "000", "000", "000", "000", "000"] },
"o": { "w": 12, "rows": ["000", "000", "000", "000", "000", "000", "000", "3fc", "7fe", "7ff", "f9f", "f8f", "f8f", "f9f", "7ff", "7fe", "3fc", "000", "000", "000", "000", "000"] },
"p": { "w": 12, "rows": ["000", "000", "000", "000", "000", "000", "000", "ffc", "ffe", "ffe", "f9e", "f1f", "f1f", "f9e", "ffe", "ffe", "ffc", "f00", "f00", "f00", "f00", "000"] },
"q": { "w": 12, "rows": ["000", "000", "000", "000", "000", "000", "000", "3ff", "7ff", "7ff", "f9f", "f8f", "f8f", "f9f", "7ff", "7ff", "3ff", "00f", "00f", "00f", "00f", "000"] },
"r": { "w": 8, "rows": ["00", "00", "00", "00", "00", "00", "00", "ff", "ff", "fc", "f8", "f0", "f0", "f0", "f0", "f0", "f0", "00", "00", "00", "00", "00"] },
"s": { "w": 10, "rows": ["000", "000", "000", "000", "000", "000", "000", "1ff", "1ff", "3ff", "3f0", "1ff", "1ff", "01f", "1ff", "1ff", "1fe", "000", "000", "000", "000", "000"] },
"t": { "w": 9, "rows": ["000", "000", "000", "000", "0f0", "0f0", "0f0", "1ff", "1ff", "0f0", "0f0", "0f0", "0f0", "0f0", "0fc", "0fe", "07e", "000", "000", "000", "000", "000"] },
"u": { "w": 11, "rows": ["000", "000", "000", "000", "000", "000", "000", "78f", "78f", "78f", "78f", "78f", "78f", "79f", "7ff", "7ff", "3ff", "000", "000", "000", "000", "000"] },
"v": { "w": 12, "rows": ["000", "000", "000", "000", "000", "000", "000", "f0f", "f9f", "79e", "7be", "7fc", "3fc", "3fc", "1f8", "1f8", "1f0", "000", "000", "000", "000", "000"] },
"w": { "w": 16, "rows": ["0000", "0000", "0000", "0000", "0000", "0000", "0000", "f3cf", "fbef", "7bef", "7bef", "7ffe", "7ffe", "3f7e", "3f7e", "3f7c", "1e7c", "0000", "0000", "0000", "0000", "0000"] },
"x": { "w": 12, "rows": ["000", "000", "000", "000", "000", "000", "000", "f9f", "7fe", "7fc", "3f8", "1f8", "1f8", "3fc", "7fc", "7be", "f9f", "000", "000", "000", "000", "000"] },
"y": { "w": 12, "rows": ["000", "000", "000", "000", "000", "000", "000", "f1f", "f9e", "79e", "7be", "7fc", "3fc", "3fc", "1f8", "1f8", "0f0", "0f0", "1f0", "7e0", "7e0", "000"] },
"z": { "w": 10, "rows": ["000", "000", "000", "000", "000", "000", "000", "1ff", "1ff", "01f", "03e", "07c", "0fc", "1f8", "3f0", "3ff", "3ff", "000", "000", "000", "000", "000"] },
"{": { "w": 9, "rows": ["000", "000", "000", "03f", "03f", "03e", "07c", "078", "078", "078", "0f8", "1f8", "1f8", "0f8", "078", "078", "07c", "03e", "03f", "03f", "000", "000"] },
"|": { "w": 3, "rows": ["0", "0", "0", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "0"] },
"}": { "w": 9, "rows": ["000", "000", "000", "1f0", "1f8", "0f8", "078", "078", "078", "07c", "07e", "03f", "03f", "07e", "078", "078", "078", "0f8", "1f8", "1f8", "000", "000"] },
"~": { "w": 13, "rows": ["0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0003", "0fff", "1fff", "1ffe", "1800", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000"] },
};

// ---- pixel buffer ----
type RGB = [number, number, number];
const PAPER: RGB = [244, 239, 228];
const NAVY: RGB = [15, 42, 68];
const GOLD: RGB = [242, 183, 5];
const INK: RGB = [22, 33, 43];
const BODY: RGB = [51, 51, 51];
const MUTED: RGB = [90, 107, 122];
const WHITE: RGB = [255, 255, 255];
const LIGHT: RGB = [200, 214, 226];
const RED: RGB = [192, 57, 43];
const PURPLE: RGB = [125, 60, 152];
const OCHRE: RGB = [185, 119, 14];
const TEAL: RGB = [17, 122, 101];
const SLATE: RGB = [46, 64, 83];
const BLUE: RGB = [26, 82, 118];

const px = new Uint8Array(W * H * 3);
function fillAll(c: RGB): void {
  for (let i = 0; i < W * H; i++) {
    px[i * 3] = c[0]; px[i * 3 + 1] = c[1]; px[i * 3 + 2] = c[2];
  }
}
function setPx(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(W, Math.ceil(x + w));
  const y1 = Math.min(H, Math.ceil(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) setPx(xx, yy, c);
  }
}

// ---- text: nearest-neighbour scaled 1-bit glyphs ----
// A glyph's advance is its width plus 2 units of side bearing, times scale.
function glyphAdvance(ch: string, scale: number): number {
  const g = FONT[ch];
  if (!g) return 8 * scale;
  return (g.w + 2) * scale;
}
function textWidth(s: string, scale: number): number {
  let w = 0;
  for (const ch of s) w += glyphAdvance(ch, scale);
  return w;
}
function drawGlyph(x: number, y: number, ch: string, scale: number, c: RGB): void {
  x = Math.floor(x);
  y = Math.floor(y);
  const g = FONT[ch];
  if (!g || g.rows.length === 0) return;
  const outW = Math.ceil(g.w * scale);
  const outH = Math.ceil(FONT_H * scale);
  for (let oy = 0; oy < outH; oy++) {
    const sy = Math.min(FONT_H - 1, Math.floor(oy / scale));
    const rowHex = g.rows[sy];
    if (!rowHex) continue;
    const rowVal = parseInt(rowHex, 16);
    const bits = rowHex.length * 4;
    for (let ox = 0; ox < outW; ox++) {
      const sx = Math.min(g.w - 1, Math.floor(ox / scale));
      const bit = (rowVal >> (bits - 1 - sx)) & 1;
      if (bit) setPx(x + ox, y + oy, c);
    }
  }
}
function drawText(x: number, y: number, s: string, scale: number, c: RGB): number {
  let cx = x;
  for (const ch of s) {
    drawGlyph(cx, y, ch, scale, c);
    cx += glyphAdvance(ch, scale);
  }
  return cx;
}
function drawCentred(y: number, s: string, scale: number, c: RGB): void {
  const x = Math.floor((W - textWidth(s, scale)) / 2);
  drawText(x, y, s, scale, c);
}
function wrapText(s: string, scale: number, maxW: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const t = cur ? cur + " " + word : word;
    if (textWidth(t, scale) <= maxW || !cur) {
      cur = t;
    } else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
function drawPara(x: number, y: number, s: string, scale: number, c: RGB, maxW: number, leading: number): number {
  const lines = wrapText(s, scale, maxW);
  let yy = y;
  for (const ln of lines) {
    drawText(x, yy, ln, scale, c);
    yy += leading;
  }
  return yy;
}
function drawTag(x: number, y: number, label: string, bg: RGB): void {
  const tw = textWidth(label, 1);
  rect(x, y, tw + 20, 24, bg);
  drawText(x + 10, y + 1, label, 1, WHITE);
}

// ---- PNG encoding (stdlib zlib + hand-rolled CRC32) ----
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}
function encodePNG(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- layout: the front page ----
// Header
fillAll(PAPER);
rect(0, 0, W, 184, NAVY);
drawText(36, 20, "WORLD NEWS - IN ONE IMAGE", 1, GOLD);
drawText(36, 40, "The World Today", 3, WHITE);
drawText(36, 112, "Thursday, 26 November 2026", 2, WHITE);
drawText(36, 158, "The day's most consequential stories, from every region.", 1, LIGHT);

// Lead story: Cairo tanker blast
const LX = 28;
const LW = W - 56;
rect(LX, 194, LW, 146, WHITE);
rect(LX, 194, 8, 146, RED);
drawTag(LX + 20, 208, "EGYPT - DISASTER", RED);
drawText(LX + 20, 240, "Tanker blast in Cairo kills 31", 1.5, INK);
drawPara(LX + 20, 284, "A fuel tanker overturned and exploded on Cairo's Ring Road, killing 31 and charring 27 vehicles; the driver was arrested.", 1, BODY, LW - 40, 24);

// Six stories, two columns by three rows
type Card = { color: RGB; tag: string; head: string; body: string };
const CARDS: Card[] = [
  { color: TEAL, tag: "TRADE - WORLD", head: "US unveils tariffs on 14 economies", body: "Washington proposed new tariffs on 14 economies, with China capped at 20%." },
  { color: NAVY, tag: "EUROPE - WAR IN UKRAINE", head: "Russian missiles hit Kyiv mall", body: "Missiles hit a shopping centre in Kyiv, wounding seven, as Russia launched 113 drones overnight." },
  { color: RED, tag: "MIDDLE EAST - CONFLICT", head: "Israeli strikes kill 10 in Gaza", body: "Strikes killed 10 in Gaza despite a year-old ceasefire; Iranian drones killed two Italians in Kuwait." },
  { color: BLUE, tag: "USA - THANKSGIVING STORM", head: "Storm cuts power to 900,000", body: "A Thanksgiving storm left 900,000 without power; the Macy's parade was postponed, a first in 100 years." },
  { color: OCHRE, tag: "MARKETS - ECONOMY", head: "Dow tops 50,000 for the first time", body: "The Dow Jones Industrial Average passed 50,000 for the first time, as tech shares fell on AI worries." },
  { color: PURPLE, tag: "ASIA - SECURITY", head: "Kim vows more nuclear weapons", body: "North Korea's Kim Jong Un vowed to build more nuclear weapons, ignoring an overture from President Trump." },
];
const GX = 28;
const GAP = 14;
const CW = (W - 56 - GAP) / 2;
const ROW_H = 198;
const GY = 350;
for (let i = 0; i < CARDS.length; i++) {
  const card = CARDS[i];
  const r = Math.floor(i / 2);
  const c = i % 2;
  const x = GX + c * (CW + GAP);
  const y = GY + r * (ROW_H + 10);
  rect(x, y, CW, ROW_H, WHITE);
  rect(x, y, CW, 5, card.color);
  drawTag(x + 16, y + 12, card.tag, card.color);
  const headEnd = drawPara(x + 16, y + 44, card.head, 1.5, INK, CW - 32, 33);
  drawPara(x + 16, headEnd + 8, card.body, 1, BODY, CW - 32, 22);
}

// Footer
drawCentred(972, "All events happened or were first reported on Thursday 26 November 2026.", 1, NAVY);
drawCentred(994, "Sources: Associated Press, Reuters, BBC, CNN, Washington Post, Financial Times.", 1, MUTED);

// ---- main ----
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), encodePNG());
