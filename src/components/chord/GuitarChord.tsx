import React from "react";
import guitarDb from "@tombatossals/chords-db/lib/guitar.json";

export interface GuitarChordProps {
  chordName: string;
}

const dbKeyMap: Record<string, string> = {
  "C": "C",
  "C#": "Csharp",
  "Db": "Csharp",
  "D": "D",
  "D#": "Eb",
  "Eb": "Eb",
  "E": "E",
  "F": "F",
  "F#": "Fsharp",
  "Gb": "Fsharp",
  "G": "G",
  "G#": "Ab",
  "Ab": "Ab",
  "A": "A",
  "A#": "Bb",
  "Bb": "Bb",
  "B": "B"
};

function normalizeSuffix(quality: string): string {
  if (quality === "") return "major";
  if (quality === "m") return "minor";
  if (quality === "maj7") return "maj7";
  if (quality === "m7") return "m7";
  if (quality === "7") return "7";
  if (quality === "dim") return "dim";
  if (quality === "sus4") return "sus4";
  if (quality === "sus2") return "sus2";
  if (quality === "aug") return "aug";
  return quality;
}

export function getGuitarChordPositions(chord: string) {
  const rootMatch = chord.match(/^([A-G][#b]?)/);
  if (!rootMatch) return [];
  const root = rootMatch[1];
  
  const key = dbKeyMap[root];
  if (!key) return [];

  const quality = chord.slice(root.length);
  const suffix = normalizeSuffix(quality);

  const keyChords = (guitarDb.chords as Record<string, any[]>)[key];
  if (!keyChords) return [];

  const match = keyChords.find(c => c.suffix === suffix || c.suffix === quality);
  if (!match || !match.positions || match.positions.length === 0) return [];

  return match.positions;
}

export function GuitarChordRenderer({ chordName }: GuitarChordProps) {
  const positions = getGuitarChordPositions(chordName);

  if (positions.length === 0) {
    return <div className="text-center p-4 text-sm text-muted-foreground">No guitar diagrams found for {chordName}</div>;
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full max-h-[350px] overflow-y-auto px-2">
      {positions.map((pos: any, idx: number) => {
        const baseFret = pos.baseFret ?? 1;
        const frets = pos.frets; // e.g. [-1, 3, 2, 0, 1, 0]
        const barres = pos.barres ?? [];

        return (
          <div key={idx} className="flex flex-col items-center w-full border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
            <span className="text-xs font-semibold text-amber-500 mb-2 uppercase tracking-wider">Position {idx + 1} (Fret {baseFret})</span>
            
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" className="w-[180px] h-[225px] relative" stroke="currentColor">
                {/* Background */}
                <path fill="transparent" d="M-1-1h202v252H-1z" />
                
                <g>
                  {/* Grid Outer Border */}
                  <path fill="transparent" strokeWidth="1.5" d="M25 25h150v200H25z" />
                  
                  {/* Grid Frets & Strings */}
                  <path fill="none" strokeWidth="1.5" d="M26 75h150M26 125h150M26 175h150M56 26v199M86 26v199m30-199v199m30-199v199" />
                  
                  {/* Chord Title */}
                  <text x="100" y="16" fontSize="16" fill="currentColor" fontWeight="bold" textAnchor="middle" stroke="none">
                    {chordName}
                  </text>
                  
                  {/* Base Fret Labels on the left */}
                  <text x="7" y="50" fill="currentColor" stroke="none" fontSize="12">{baseFret}</text>
                  <text x="7" y="100" fill="currentColor" stroke="none" fontSize="12">{baseFret + 1}</text>
                  <text x="7" y="150" fill="currentColor" stroke="none" fontSize="12">{baseFret + 2}</text>
                  <text x="7" y="200" fill="currentColor" stroke="none" fontSize="12">{baseFret + 3}</text>
                  
                  {/* Barre chords rendering */}
                  {barres.map((barreFret: number, bIdx: number) => {
                    const displayFret = barreFret - baseFret + 1;
                    if (displayFret >= 1 && displayFret <= 4) {
                      return (
                        <ellipse 
                          key={bIdx}
                          cx="100" 
                          cy={50 * displayFret} 
                          fill="currentColor" 
                          strokeWidth="1.5" 
                          ry="4" 
                          rx="75" 
                        />
                      );
                    }
                    return null;
                  })}
                  
                  {/* Muted strings and Open strings at the top */}
                  {frets.map((fret: number, stringIdx: number) => {
                    const cx = 26 + 30 * stringIdx;
                    if (fret === -1) {
                      // Draw muted string X
                      return (
                        <text key={stringIdx} x={cx - 4} y={23} fontSize="12" fill="currentColor" stroke="none" fontWeight="bold">
                          ×
                        </text>
                      );
                    } else if (fret === 0) {
                      // Draw open string O
                      return (
                        <circle key={stringIdx} cx={cx} cy={18} r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      );
                    }
                    return null;
                  })}

                  {/* Finger placements */}
                  {frets.map((fret: number, stringIdx: number) => {
                    if (fret > 0) {
                      const displayFret = fret - baseFret + 1;
                      if (displayFret >= 1 && displayFret <= 4) {
                        const cx = 26 + 30 * stringIdx;
                        const cy = 50 * displayFret;
                        return (
                          <ellipse 
                            key={stringIdx} 
                            cx={cx} 
                            cy={cy} 
                            fill="currentColor" 
                            strokeOpacity="null" 
                            strokeWidth="1.5" 
                            ry="6" 
                            rx="6" 
                          />
                        );
                      }
                    }
                    return null;
                  })}
                </g>
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
