import { renderSVG } from 'svg-piano/keyboard.js';

const options = {
  range: ['G3', 'C5'],
  scaleX: 1.5,
  scaleY: 1.5,
  lowerHeight: 35,
  upperHeight: 65,
  palette: ["#18181b", "#ffffff"],
  stroke: "#18181b",
  strokeWidth: 1.5,
  labels: { 'C4': 'C', 'E4': 'E', 'G4': 'G' },
  topLabels: false
};

const rendered = renderSVG(options);
console.log(rendered.svg.width, rendered.svg.height);
