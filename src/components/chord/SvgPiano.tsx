import { renderSVG } from "svg-piano/keyboard.js";
import { getPianoNotes } from "./piano";
import { Note } from "@tonaljs/tonal";

export function SvgPianoRenderer({ chordName, width = 200, height = 80 }: { chordName: string; width?: number; height?: number }) {
  // get notes using our existing tonal.js logic
  const notes = getPianoNotes(chordName);
  
  // map 0-11 to SPN (e.g. C3, C#3)
  const chromaToSPN = (chroma: number) => {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    // use octave 4 for rendering
    return `${noteNames[chroma]}4`;
  };

  const keysToColor = notes.map(chromaToSPN);

  const options = {
    range: ["C4", "C5"],
    scaleX: 1,
    scaleY: 1,
    lowerHeight: 50,
    upperHeight: 30,
    palette: ["#18181b", "#f4f4f5"],
    stroke: "#27272a",
    colorize: [
      { keys: keysToColor, color: "#f59e0b" } // amber
    ]
  };

  try {
    const rendered = renderSVG(options);
    return (
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
            </g>
          );
        })}
        <text x={rendered.svg.width / 2} y={rendered.svg.height + 14} textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="bold">
          {chordName}
        </text>
      </svg>
    );
  } catch (err) {
    return <div>Error rendering piano</div>;
  }
}
