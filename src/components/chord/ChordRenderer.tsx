"use client";

import { useMemo, useState } from "react";
import { parseSongBlocks } from "@/lib/chord/parser";
import { transposeChord } from "@/lib/chord/transposer";
import type { AccidentalPreference } from "@/types/settings";
import { ChordDiagram } from "./ChordDiagram";
import { cn } from "@/lib/utils";
import type { LyricSegment } from "@/lib/chord/parser";

interface ChordRendererProps {
  content: string;
  transpose?: number;
  accidentalPreference?: AccidentalPreference;
  chordSize?: number;
  fontSize?: number;
  lineSpacing?: number;
  performance?: boolean;
  className?: string;
}

interface WordToken {
  chord: string | null;
  word: string;
}

/**
 * Splits a list of lyric segments into individual word-level tokens.
 * Each token carries the chord that belongs to that word (only the first
 * word of a segment gets the chord; the rest carry null).
 *
 * This lets us use flex-wrap at word granularity so lines break at spaces,
 * never in the middle of a segment (which would misalign chords).
 */
function segmentsToWordTokens(
  segments: LyricSegment[],
  transpose: number,
  accidentalPreference: AccidentalPreference
): WordToken[] {
  const tokens: WordToken[] = [];

  for (const seg of segments) {
    const chord = seg.chord
      ? transposeChord(seg.chord, transpose, accidentalPreference)
      : null;

    // Split text into space-delimited words, keeping trailing space on each word.
    // e.g. "They told him, " → ["They ", "told ", "him, "]
    const parts = seg.text.split(/(?<=\s)|(?=\S)/).reduce<string[]>((acc, part) => {
      if (acc.length === 0) return [part];
      const last = acc[acc.length - 1];
      // If last ends in space, start a new token; otherwise append
      if (/\s$/.test(last)) {
        return [...acc, part];
      }
      return [...acc.slice(0, -1), last + part];
    }, []);

    // Simpler split: split on space boundaries
    const wordParts = splitIntoWordUnits(seg.text);

    wordParts.forEach((word, i) => {
      tokens.push({ chord: i === 0 ? chord : null, word });
    });
  }

  return tokens;
}

/**
 * Splits a string into word units where each unit ends at a space boundary.
 * Spaces are attached to the preceding word so the chord aligns with the
 * first letter of the word that follows.
 *
 * "They told him, " → ["They ", "told ", "him, "]
 * "here"           → ["here"]
 * ""               → [""]
 */
function splitIntoWordUnits(text: string): string[] {
  if (!text) return [""];
  // Match: any non-space chars followed by optional spaces
  const matches = text.match(/\S+\s*|\s+/g);
  return matches ?? [text];
}

function WordCell({
  token,
  chordSize,
  fontSize,
  onChordClick,
}: {
  token: WordToken;
  chordSize: number;
  fontSize: number;
  onChordClick: (chord: string) => void;
}) {
  return (
    <span className="inline-flex flex-col items-start align-bottom flex-shrink-0">
      {/* Chord slot — always reserves height so text rows stay aligned */}
      <span
        className="flex items-end leading-none"
        style={{ fontSize: chordSize, height: chordSize * 1.5, minWidth: token.chord ? undefined : 0 }}
        aria-hidden={!token.chord}
      >
        {token.chord ? (
          <button
            type="button"
            onClick={() => onChordClick(token.chord!)}
            className="font-mono font-semibold text-amber-500 hover:text-amber-400 p-0 whitespace-nowrap"
          >
            {token.chord}
          </button>
        ) : null}
      </span>
      {/* Word text */}
      <span className="whitespace-pre text-foreground" style={{ fontSize }}>
        {token.word || "\u00A0"}
      </span>
    </span>
  );
}

export function ChordRenderer({
  content,
  transpose = 0,
  accidentalPreference = "auto",
  chordSize = 14,
  fontSize = 18,
  lineSpacing = 1.4,
  performance = false,
  className,
}: ChordRendererProps) {
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  const blocks = useMemo(() => parseSongBlocks(content), [content]);

  return (
    <>
      <div className={cn("font-sans", className)}>
        {blocks.map((block, blockIndex) => (
          <div
            key={blockIndex}
            className={cn(
              "mb-4 relative",
              block.type === "chorus" &&
                "border-l-4 border-amber-500/40 pl-4 bg-amber-500/5 py-2 -ml-4 pr-2 rounded-r"
            )}
          >
            {block.type !== "normal" && (
              <div
                className="font-semibold uppercase tracking-wider text-muted-foreground mb-2 opacity-70"
                style={{ fontSize: chordSize }}
              >
                {block.type}
              </div>
            )}
            {block.lines.map((segments, lineIndex) => {
              const hasContent = segments.some((s) => s.text.trim() || s.chord);
              if (!hasContent) {
                return <div key={lineIndex} style={{ height: fontSize * 0.5 }} />;
              }

              const tokens = segmentsToWordTokens(segments, transpose, accidentalPreference);
              const hasChords = tokens.some((t) => t.chord);

              return (
                <div
                  key={lineIndex}
                  className="flex flex-wrap items-end"
                  style={{ marginBottom: performance ? fontSize * 0.35 : fontSize * 0.2, lineHeight: lineSpacing }}
                >
                  {tokens.map((token, tokenIndex) => (
                    hasChords ? (
                      <WordCell
                        key={tokenIndex}
                        token={token}
                        chordSize={chordSize}
                        fontSize={fontSize}
                        onChordClick={setSelectedChord}
                      />
                    ) : (
                      // Pure lyric line (no chords at all) — render as plain text for efficiency
                      tokenIndex === 0 ? (
                        <span
                          key="lyric"
                          className="whitespace-pre-wrap break-words text-foreground"
                          style={{ fontSize }}
                        >
                          {tokens.map(t => t.word).join("")}
                        </span>
                      ) : null
                    )
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedChord && (
        <ChordDiagram
          chord={selectedChord}
          open={!!selectedChord}
          onOpenChange={(open) => !open && setSelectedChord(null)}
        />
      )}
    </>
  );
}