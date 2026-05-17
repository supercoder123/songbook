"use client";

import { useState } from "react";
import { renderGuitarSvg } from "@/lib/chord/diagrams/guitar";
import { renderPianoSvg } from "@/lib/chord/diagrams/piano";
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
      <DialogContent className="sm:max-w-[320px]">
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
          <TabsContent value="guitar" className="flex justify-center pt-6 pb-2">
            <div
              className="text-foreground [&>svg]:w-32 [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: renderGuitarSvg(chord, 140, 160) }}
            />
          </TabsContent>
          <TabsContent value="piano" className="flex justify-center pt-8 pb-2">
            <div
              className="text-foreground w-full flex justify-center [&>svg]:w-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: renderPianoSvg(chord, 300, 110) }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
