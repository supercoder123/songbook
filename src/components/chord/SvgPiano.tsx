// @ts-ignore
import { renderSVG } from "svg-piano/keyboard.js";
import { Chord, Note } from "@tonaljs/tonal";

export interface PianoInversion {
  name: string;
  midiNotes: string[]; // Simplified notes for svg-piano to highlight
  labels: Record<string, string>; // Map of midiNote to original label
  range: string[];
}

export function getPianoInversions(chordName: string): PianoInversion[] {
  const chord = Chord.get(chordName);
  if (chord.empty || chord.notes.length === 0) return [];

  const chordNotes = chord.notes;
  const rootNote = chordNotes[0];
  
  // Create a list of original notes mapped to their ascending midi values starting at octave 4
  interface NoteMap {
    original: string;
    simplified: string;
    midi: number;
  }

  const absoluteNotes: NoteMap[] = [];
  
  let lastMidi = Note.midi(rootNote + "4");
  if (lastMidi === null || lastMidi === undefined) return [];
  
  absoluteNotes.push({
    original: rootNote,
    simplified: Note.simplify(rootNote),
    midi: lastMidi
  });

  for (let i = 1; i < chordNotes.length; i++) {
    const originalNote = chordNotes[i];
    const simplified = Note.simplify(originalNote);
    let pcMidi = Note.midi(simplified + "4");
    if (pcMidi === null || pcMidi === undefined) continue;
    while (pcMidi <= lastMidi) {
      pcMidi += 12;
    }
    absoluteNotes.push({
      original: originalNote,
      simplified: simplified,
      midi: pcMidi
    });
    lastMidi = pcMidi;
  }

  // Generate all inversions
  const inversions: PianoInversion[] = [];
  const names = ["Root Position", "1st Inversion", "2nd Inversion", "3rd Inversion", "4th Inversion"];

  for (let k = 0; k < absoluteNotes.length; k++) {
    // Shift notes before k by one octave (+12 semitones)
    const invNotes = absoluteNotes.map((n, index) => {
      const midi = index < k ? n.midi + 12 : n.midi;
      const midiNote = Note.fromMidi(midi);
      return {
        midiNote,
        midi,
        label: Note.pitchClass(n.original)
      };
    });

    // Sort ascending by midi for correct rendering
    invNotes.sort((a, b) => a.midi - b.midi);

    const lowestNote = invNotes[0].midiNote;
    const lowestMidi = Note.midi(lowestNote)!;
    const highestNote = Note.fromMidi(lowestMidi + 12);

    const midiNotes = invNotes.map(n => n.midiNote);
    const labelsMap: Record<string, string> = {};
    invNotes.forEach(n => {
      labelsMap[n.midiNote] = n.label;
    });

    inversions.push({
      name: names[k] || `${k}th Inversion`,
      midiNotes,
      labels: labelsMap,
      range: [lowestNote, highestNote]
    });
  }

  return inversions;
}

export function SvgPianoRenderer({ chordName }: { chordName: string }) {
  const inversions = getPianoInversions(chordName);

  if (inversions.length === 0) {
    return <div className="text-center p-4 text-sm text-muted-foreground">No piano diagrams found for {chordName}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-h-[350px] overflow-y-auto px-2">
      {inversions.map((inv, idx) => {
        const options = {
          range: inv.range,
          scaleX: 1.2,
          scaleY: 1.2,
          lowerHeight: 50,
          upperHeight: 30,
          palette: ["#18181b", "#ffffff"],
          stroke: "#27272a",
          labels: inv.labels,
          topLabels: false,
          colorize: [
            { keys: inv.midiNotes, color: "#f59e0b" } // Amber active keys
          ]
        };

        let rendered;
        try {
          rendered = renderSVG(options);
        } catch (e) {
          return null;
        }

        return (
          <div key={idx} className="flex flex-col items-center w-full border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
            <span className="text-xs font-semibold text-amber-500 mb-2 uppercase tracking-wider">{inv.name}</span>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 overflow-x-auto w-full flex justify-center">
              <svg width={rendered.svg.width} height={rendered.svg.height} viewBox={`0 0 ${rendered.svg.width} ${rendered.svg.height}`}>
                {rendered.children.map((child: any, i: number) => {
                  if (!child) return null;
                  return (
                    <g key={i}>
                      <polygon 
                        points={child.polygon.points} 
                        fill={child.polygon.style.fill} 
                        stroke={child.polygon.style.stroke} 
                        strokeWidth={child.polygon.style.strokeWidth} 
                      />
                      {child.circle && (
                         <circle cx={child.circle.cx} cy={child.circle.cy} r={child.circle.r} fill={child.circle.fill} stroke={child.circle.stroke} strokeWidth={child.circle.strokeWidth} />
                      )}
                      {child.text && (
                         <text x={child.text.x} y={child.text.y} textAnchor={child.text.textAnchor} fontSize={child.text.fontSize} fill="#000" fontWeight="bold">
                           {child.text.value}
                         </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
