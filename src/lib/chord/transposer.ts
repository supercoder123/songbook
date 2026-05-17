import type { AccidentalPreference } from "@/types/settings";
import { normalizeChordContent, parseLyricLine, type LyricToken } from "./parser";
import { chordToSemitone, normalizeChord, parseChord, semitoneToNote } from "./normalize";

export function transposeChord(
  chord: string,
  semitones: number,
  preference: AccidentalPreference = "auto"
): string {
  const parsed = parseChord(chord);
  if (!parsed) return chord;
  const rootSemi = chordToSemitone(parsed.root);
  if (rootSemi === null) return chord;
  const wasSharp = parsed.root.includes("#");
  const newRoot = semitoneToNote(rootSemi + semitones, preference, wasSharp);
  return normalizeChord(newRoot + parsed.suffix, preference);
}

export function transposeLine(
  line: string,
  semitones: number,
  preference: AccidentalPreference = "auto"
): string {
  const tokens = parseLyricLine(line);
  return tokens
    .map((token) =>
      token.type === "chord"
        ? transposeChord(token.value, semitones, preference)
        : token.value
    )
    .join("");
}

export function transposeContent(
  content: string,
  semitones: number,
  preference: AccidentalPreference = "auto"
): string {
  const normalized = normalizeChordContent(content);
  return normalized
    .split("\n")
    .map((line) => transposeLine(line, semitones, preference))
    .join("\n");
}

export function transposeTokens(
  tokens: LyricToken[],
  semitones: number,
  preference: AccidentalPreference = "auto"
): LyricToken[] {
  return tokens.map((token) =>
    token.type === "chord"
      ? { ...token, value: transposeChord(token.value, semitones, preference) }
      : token
  );
}

export function semitonesBetweenKeys(fromKey: string, toKey: string): number {
  const from = chordToSemitone(fromKey);
  const to = chordToSemitone(toKey);
  if (from === null || to === null) return 0;
  return ((to - from) % 12 + 12) % 12;
}

export function keyFromTranspose(originalKey: string, semitones: number, preference: AccidentalPreference = "auto"): string {
  const semi = chordToSemitone(originalKey);
  if (semi === null) return originalKey;
  return semitoneToNote(semi + semitones, preference);
}
