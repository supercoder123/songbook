"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { keyFromTranspose } from "@/lib/chord/transposer";
import type { AccidentalPreference } from "@/types/settings";

interface TransposeControlsProps {
  originalKey: string;
  transposeOffset: number;
  onTransposeChange: (offset: number) => void;
  accidentalPreference?: AccidentalPreference;
  compact?: boolean;
}

export function TransposeControls({
  originalKey,
  transposeOffset,
  onTransposeChange,
  accidentalPreference = "auto",
  compact = false,
}: TransposeControlsProps) {
  const currentKey = keyFromTranspose(
    originalKey,
    transposeOffset,
    accidentalPreference
  );

  return (
    <div
      className={
        compact
          ? "flex items-center gap-1"
          : "flex flex-wrap items-center gap-2"
      }
    >
      <Button
        variant="outline"
        size={compact ? "icon-sm" : "icon"}
        onClick={() => onTransposeChange(transposeOffset - 1)}
        aria-label="Transpose down"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Select
        value={String(transposeOffset)}
        onValueChange={(v) => onTransposeChange(Number(v))}
      >
        <SelectTrigger className={compact ? "h-8 w-20" : "w-24"}>
          <SelectValue>{currentKey}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i - 6).map((offset) => (
            <SelectItem key={offset} value={String(offset)}>
              {keyFromTranspose(originalKey, offset, accidentalPreference)}
              {offset !== 0 ? ` (${offset > 0 ? "+" : ""}${offset})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size={compact ? "icon-sm" : "icon"}
        onClick={() => onTransposeChange(transposeOffset + 1)}
        aria-label="Transpose up"
      >
        <Plus className="h-4 w-4" />
      </Button>
      {transposeOffset !== 0 && (
        <Button
          variant="ghost"
          size={compact ? "icon-sm" : "icon"}
          onClick={() => onTransposeChange(0)}
          aria-label="Reset key"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      {!compact && (
        <span className="text-sm text-muted-foreground">
          Original: {originalKey}
        </span>
      )}
    </div>
  );
}
