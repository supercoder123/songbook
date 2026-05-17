export type ChordToken = { type: "chord"; value: string };
export type TextToken = { type: "text"; value: string };
export type LyricToken = ChordToken | TextToken;

export interface LyricSegment {
  chord: string | null;
  text: string;
}

export type BlockType = "verse" | "chorus" | "bridge" | "normal";

export interface SongBlock {
  type: BlockType;
  lines: LyricSegment[][];
  rawContent: string;
}

const INLINE_CHORD_REGEX = /\[([^\]]+)\]/g;

/** Matches a standalone chord line (ChordPro / chord-sheet style). */
const CHORD_ONLY_LINE_REGEX =
  /^\s*([A-G][#b]?(?:maj|min|m|M|dim|aug|sus[24]?|add\d+|maj7|m7|7|9|11|13)*)\s*$/i;

export function isChordOnlyLine(line: string): boolean {
  return CHORD_ONLY_LINE_REGEX.test(line.trim());
}

export function normalizeChordContent(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push("");
      continue;
    }

    if (isChordOnlyLine(trimmed) && i + 1 < lines.length) {
      const next = lines[i + 1];
      const nextTrimmed = next.trim();
      if (nextTrimmed && !isChordOnlyLine(nextTrimmed) && !nextTrimmed.startsWith("[")) {
        const chord = trimmed.match(CHORD_ONLY_LINE_REGEX)?.[1] ?? trimmed;
        const leadingSpaces = next.match(/^\s*/)?.[0] ?? "";
        const lyric = next.trimStart();
        result.push(`${leadingSpaces}[${chord}]${lyric}`);
        i++;
        continue;
      }
    }

    result.push(line);
  }

  return result.join("\n");
}

export function parseLyricLine(line: string): LyricToken[] {
  const tokens: LyricToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(INLINE_CHORD_REGEX.source, "g");

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: line.slice(lastIndex, match.index),
      });
    }
    tokens.push({ type: "chord", value: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }

  return tokens;
}

export function parseLineSegments(line: string): LyricSegment[] {
  const tokens = parseLyricLine(line);
  const segments: LyricSegment[] = [];
  let pendingChord: string | null = null;

  for (const token of tokens) {
    if (token.type === "chord") {
      if (pendingChord !== null) {
        segments.push({ chord: pendingChord, text: "" });
      }
      pendingChord = token.value;
    } else if (token.value.length > 0 || segments.length > 0) {
      segments.push({ chord: pendingChord, text: token.value });
      pendingChord = null;
    }
  }

  if (pendingChord !== null) {
    segments.push({ chord: pendingChord, text: "" });
  }

  if (segments.length === 0 && line.length > 0) {
    segments.push({ chord: null, text: line });
  }

  return segments;
}

export function parseLyricContent(content: string): LyricSegment[][] {
  const normalized = normalizeChordContent(content);
  return normalized
    .split("\n")
    .map((line) => parseLineSegments(line));
}

export function parseSongBlocks(content: string): SongBlock[] {
  const normalized = normalizeChordContent(content);
  const lines = normalized.split("\n");
  
  const blocks: SongBlock[] = [];
  let currentBlockType: BlockType = "normal";
  let currentLines: LyricSegment[][] = [];
  let currentRawLines: string[] = [];

  const pushBlock = () => {
    const hasText = currentRawLines.some(l => l.trim() !== "");
    if (hasText) {
      blocks.push({ type: currentBlockType, lines: currentLines, rawContent: currentRawLines.join("\n") });
    }
    currentLines = [];
    currentRawLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    
    if (trimmed.startsWith("{start_of_verse}") || trimmed === "{sov}") {
      pushBlock();
      currentBlockType = "verse";
      continue;
    }
    if (trimmed.startsWith("{start_of_chorus}") || trimmed === "{soc}") {
      pushBlock();
      currentBlockType = "chorus";
      continue;
    }
    if (trimmed.startsWith("{start_of_bridge}") || trimmed === "{sob}") {
      pushBlock();
      currentBlockType = "bridge";
      continue;
    }
    if (trimmed.startsWith("{end_of_verse}") || trimmed === "{eov}" || 
        trimmed.startsWith("{end_of_chorus}") || trimmed === "{eoc}" ||
        trimmed.startsWith("{end_of_bridge}") || trimmed === "{eob}") {
      pushBlock();
      currentBlockType = "normal";
      continue;
    }
    
    // Ignore other directives for now or handle them as text
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      continue; 
    }

    currentLines.push(parseLineSegments(line));
    currentRawLines.push(line);
  }

  pushBlock();
  
  return blocks;
}

export function wrapSelectionWithChord(
  text: string,
  start: number,
  end: number
): string {
  const selected = text.slice(start, end);
  const wrapped = selected ? `[${selected}]` : "[]";
  return text.slice(0, start) + wrapped + text.slice(end);
}
