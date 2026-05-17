"use client";

import { useState } from "react";
// @ts-ignore
import GuitarChord from "react-guitar-chord";
import { SvgPianoRenderer } from "./SvgPiano";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChordDiagramProps {
  chord: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReactGuitarRenderer({ chord }: { chord: string }) {
  const rootMatch = chord.match(/^([A-G][#b]?)/);
  if (!rootMatch) return <div className="p-4 text-center">{chord}</div>;
  const root = rootMatch[1];
  const qualityStr = chord.slice(root.length);
  const quality = qualityStr.includes("m") ? "MIN" : "MAJ";

  return (
    <div className="flex flex-col items-center fill-current stroke-current">
      <GuitarChord chord={root} quality={quality} background="transparent" />
      <span className="mt-2 text-sm font-bold">{chord}</span>
    </div>
  );
}

export function ChordDiagram({ chord, open, onOpenChange }: ChordDiagramProps) {
  const [instrument, setInstrument] = useState<"guitar" | "piano">("guitar");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>{chord}</DialogTitle>
        </DialogHeader>
        <Tabs
          value={instrument}
          onValueChange={(v) => setInstrument(v as "guitar" | "piano")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guitar">Guitar</TabsTrigger>
            <TabsTrigger value="piano">Piano</TabsTrigger>
          </TabsList>
          <TabsContent value="guitar" className="flex justify-center pt-4 pb-2">
            <ReactGuitarRenderer chord={chord} />
          </TabsContent>
          <TabsContent value="piano" className="flex justify-center pt-4 pb-2">
            <SvgPianoRenderer chordName={chord} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
