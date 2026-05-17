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

export function renderPianoSvg(chord: string, width = 200, height = 80): string {
  const notes = new Set(getPianoNotes(chord));
  const whiteCount = 14;
  const whiteWidth = width / whiteCount;
  const blackWidth = whiteWidth * 0.6;
  const blackHeight = height * 0.55;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="transparent"/>`;

  let whiteIndex = 0;
  for (let octave = 0; octave < 2; octave++) {
    for (const semi of WHITE_KEYS) {
      const note = (octave * 12 + semi) % 12;
      const x = whiteIndex * whiteWidth;
      const active = notes.has(note);
      svg += `<rect x="${x}" y="0" width="${whiteWidth - 1}" height="${height}" fill="${active ? "#f59e0b" : "#f4f4f5"}" stroke="#27272a" rx="2"/>`;
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
          svg += `<rect x="${x}" y="0" width="${blackWidth}" height="${blackHeight}" fill="${active ? "#d97706" : "#18181b"}" stroke="#27272a" rx="2"/>`;
        }
      }
      whiteIndex++;
    }
  }

  svg += `<text x="${width / 2}" y="${height - 4}" text-anchor="middle" font-size="11" font-weight="bold" fill="currentColor">${chord}</text>`;
  svg += `</svg>`;
  return svg;
}
