"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface AutoScrollControlsProps {
  playing: boolean;
  speed: number;
  useBpm: boolean;
  bpm?: number;
  onPlayingChange: (playing: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onUseBpmChange: (use: boolean) => void;
}

export function AutoScrollControls({
  playing,
  speed,
  useBpm,
  bpm = 72,
  onPlayingChange,
  onSpeedChange,
  onUseBpmChange,
}: AutoScrollControlsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/80 p-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPlayingChange(!playing)}
          aria-label={playing ? "Pause scroll" : "Play scroll"}
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <span className="text-sm font-medium">Auto-scroll</span>
        <div className="ml-auto flex items-center gap-2">
            <Switch
              id="bpm-scroll"
              checked={useBpm}
              onCheckedChange={onUseBpmChange}
            />
            <label htmlFor="bpm-scroll" className="text-xs" title="When on, auto-scroll speed is synced to the song's BPM instead of a manual speed">
              Sync to BPM ({bpm})
            </label>
        </div>
      </div>
      {!useBpm && (
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs text-muted-foreground">Speed</span>
          <Slider
            value={[speed]}
            min={10}
            max={120}
            step={5}
            onValueChange={(v) => onSpeedChange(Array.isArray(v) ? v[0] : v)}
            className="flex-1"
          />
          <span className="w-8 text-xs text-muted-foreground">{speed}</span>
        </div>
      )}
    </div>
  );
}