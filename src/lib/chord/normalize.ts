import { NOTE_TO_SEMITONE } from "./constants";
import type { AccidentalPreference } from "@/types/settings";

export interface ParsedChord {
  root: string;
  suffix: string;
  raw: string;
}

const CHORD_REGEX = /^([A-G][#b]?)(.*)$/;

export function parseChord(chord: string): ParsedChord | null {
  const trimmed = chord.trim();
  const match = trimmed.match(CHORD_REGEX);
  if (!match) return null;
  return { root: match[1], suffix: match[2] ?? "", raw: trimmed };
}

export function chordToSemitone(chord: string): number | null {
  const parsed = parseChord(chord);
  if (!parsed) return null;
  const semi = NOTE_TO_SEMITONE[parsed.root];
  return semi === undefined ? null : semi;
}

export function semitoneToNote(
  semitone: number,
  preference: AccidentalPreference = "auto",
  useSharp?: boolean
): string {
  const normalized = ((semitone % 12) + 12) % 12;
  const preferSharp =
    preference === "sharp"
      ? true
      : preference === "flat"
        ? false
        : (useSharp ?? [1, 3, 6, 8, 10].includes(normalized));

  const names = preferSharp
    ? ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    : ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  return names[normalized];
}

export function normalizeChord(
  chord: string,
  preference: AccidentalPreference = "auto"
): string {
  const parsed = parseChord(chord);
  if (!parsed) return chord;
  const semi = chordToSemitone(parsed.root);
  if (semi === null) return chord;
  const wasSharp = parsed.root.includes("#");
  return semitoneToNote(semi, preference, wasSharp) + parsed.suffix;
}
