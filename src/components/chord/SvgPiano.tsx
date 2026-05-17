import { renderSVG } from "svg-piano/keyboard.js";
import { getPianoNotes } from "@/lib/chord/diagrams/piano";
import { Note } from "@tonaljs/tonal";

export function SvgPianoRenderer({ chordName, width = 300, height = 120 }: { chordName: string; width?: number; height?: number }) {
  // get notes using tonal.js
  const notes = getPianoNotes(chordName);
  
  // map 0-11 to SPN (e.g. C3, C#3) and build labels map
  const keysToColor: string[] = [];
  const labels: Record<string, string> = {};

  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  notes.forEach(chroma => {
    const spn = `${noteNames[chroma]}4`;
    keysToColor.push(spn);
    labels[spn] = noteNames[chroma];
  });

  const options = {
    range: ["C4", "C5"],
    scaleX: 1.5,
    scaleY: 1.5,
    lowerHeight: 50,
    upperHeight: 30,
    palette: ["#18181b", "#f4f4f5"],
    stroke: "#27272a",
    labels: labels,
    topLabels: false,
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
    );
  } catch (err) {
    return <div>Error rendering piano</div>;
  }
}
