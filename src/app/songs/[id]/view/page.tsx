"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Play, Edit } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChordRenderer } from "@/components/chord/ChordRenderer";
import { TransposeControls } from "@/components/performance/TransposeControls";
import { useSongStore } from "@/stores/song-store";
import { useSettingsStore } from "@/stores/settings-store";

export default function ViewSongPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const song = useSongStore((s) => s.getById(id));
  const settings = useSettingsStore((s) => s.settings);
  const [transpose, setTranspose] = useState(0);

  if (!song) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Song not found</p>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{song.title}</h1>
          <p className="text-muted-foreground">{song.artist}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/20">
              Key: {song.originalKey}
            </span>
            {song.bpm && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/20">
                {song.bpm} BPM
              </span>
            )}
            {song.timeSignature && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/20">
                {song.timeSignature}
              </span>
            )}
            {song.tags?.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                {tag}
              </span>
            ))}
          </div>
          {song.notes && (
            <div className="mt-4 rounded-lg bg-amber-500/10 p-3 border border-amber-500/20 text-sm text-amber-500">
              <span className="font-semibold block mb-1">Notes:</span>
              <p className="whitespace-pre-wrap">{song.notes}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            {song.youtubeUrl && (
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "text-red-500 hover:text-red-600")}
              >
                YouTube
              </a>
            )}
            <Link
              href={`/songs/${id}/edit`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
            <Link href={`/songs/${id}/perform`} className={cn(buttonVariants())}>
              <Play className="mr-2 h-4 w-4" />
              Perform
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <TransposeControls
          originalKey={song.originalKey}
          transposeOffset={transpose}
          onTransposeChange={setTranspose}
          accidentalPreference={settings?.accidentalPreference}
        />
      </div>

      <div className="mb-8">
        <ChordRenderer
          content={song.content || ""}
          transpose={transpose}
          accidentalPreference={settings?.accidentalPreference}
        />
      </div>
    </div>
  );
}
