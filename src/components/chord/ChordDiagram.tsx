"use client";

import { useState } from "react";
import { GuitarChordRenderer } from "./GuitarChord";
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

export function ChordDiagram({ chord, open, onOpenChange }: ChordDiagramProps) {
  const [instrument, setInstrument] = useState<"guitar" | "piano">("guitar");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-amber-500 font-bold">{chord} Variations</DialogTitle>
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
            <GuitarChordRenderer chordName={chord} />
          </TabsContent>
          <TabsContent value="piano" className="flex justify-center pt-4 pb-2">
            <SvgPianoRenderer chordName={chord} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
