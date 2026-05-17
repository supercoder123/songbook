import { Chord, Note } from "@tonaljs/tonal";

const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_OFFSETS = [1, 3, 6, 8, 10];

export function getPianoNotes(chordName: string): number[] {
  const chord = Chord.get(chordName);
  if (chord.empty) return [];
  // Convert note names to semitones (0 = C, 1 = C#, etc.)
  return chord.notes.map(note => {
    const chroma = Note.chroma(note);
    return chroma !== undefined ? chroma : -1;
  }).filter(c => c !== -1);
}

export function renderPianoSvg(chord: string, width = 240, height = 100): string {
  const parsedChord = Chord.get(chord);
  const notes = new Set(getPianoNotes(chord));
  const noteNames = parsedChord.empty ? [] : parsedChord.notes;
  
  // Create a map of semitone to note name to display on the keys
  const semiToName = new Map<number, string>();
  noteNames.forEach(n => {
    const chroma = Note.chroma(n);
    if (chroma !== undefined && !semiToName.has(chroma)) {
      semiToName.set(chroma, Note.pitchClass(n));
    }
  });

  const whiteCount = 14;
  const whiteWidth = width / whiteCount;
  const blackWidth = whiteWidth * 0.65;
  const blackHeight = height * 0.6;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="transparent"/>`;

  let whiteIndex = 0;
  for (let octave = 0; octave < 2; octave++) {
    for (const semi of WHITE_KEYS) {
      const note = (octave * 12 + semi) % 12;
      const x = whiteIndex * whiteWidth;
      const active = notes.has(note);
      svg += `<rect x="${x}" y="0" width="${whiteWidth}" height="${height}" fill="${active ? "#f59e0b" : "#ffffff"}" stroke="#27272a" stroke-width="1.5" rx="3"/>`;
      if (active) {
        const name = semiToName.get(note) || "";
        svg += `<text x="${x + whiteWidth/2}" y="${height - 12}" text-anchor="middle" font-size="12" font-weight="bold" fill="${active ? "#000" : "transparent"}">${name}</text>`;
      }
      whiteIndex++;
    }
  }

  whiteIndex = 0;
  for (let octave = 0; octave < 2; octave++) {
    for (let i = 0; i < WHITE_KEYS.length; i++) {
      const semi = WHITE_KEYS[i];
      const nextSemi = WHITE_KEYS[i + 1] ?? 12;
      if (nextSemi - semi === 2) {
        const blackNote = (octave * 12 + semi + 1) % 12;
        const x = (whiteIndex + 1) * whiteWidth - blackWidth / 2;
        const active = notes.has(blackNote);
        if (BLACK_OFFSETS.includes(blackNote % 12) || blackNote % 12 === 1) {
          svg += `<rect x="${x}" y="0" width="${blackWidth}" height="${blackHeight}" fill="${active ? "#f59e0b" : "#18181b"}" stroke="#27272a" stroke-width="1.5" rx="2"/>`;
          if (active) {
            const name = semiToName.get(blackNote) || "";
            svg += `<text x="${x + blackWidth/2}" y="${blackHeight - 8}" text-anchor="middle" font-size="10" font-weight="bold" fill="#000">${name}</text>`;
          }
        }
      }
      whiteIndex++;
    }
  }

  // svg += `<text x="${width / 2}" y="12" text-anchor="middle" font-size="12" font-weight="bold" fill="#27272a">${chord}</text>`;
  svg += `</svg>`;
  return svg;
}
