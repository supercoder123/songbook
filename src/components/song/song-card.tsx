"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Edit, Play, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Song } from "@/types/song";

interface SongCardProps {
  song: Song;
  index: number;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SongCard({
  song,
  index,
  onToggleFavorite,
  onDuplicate,
  onDelete,
}: SongCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="group transition-colors hover:border-amber-500/30">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="min-w-0 flex-1">
            <Link href={`/songs/${song.id}/view`}>
              <h3 className="truncate font-semibold hover:text-amber-500">
                {song.title}
              </h3>
            </Link>
            <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleFavorite}
            className="shrink-0"
          >
            <Star
              className={cn(
                "h-4 w-4",
                song.favorite ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
              )}
            />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{song.currentKey}</Badge>
            {song.bpm && <Badge variant="outline">{song.bpm} BPM</Badge>}
            {song.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
            <Link
              href={`/songs/${song.id}/perform`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <Play className="mr-1 h-3 w-3" />
              Perform
            </Link>
            <Link
              href={`/songs/${song.id}/edit`}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
            >
              <Edit className="h-4 w-4" />
            </Link>
            <Button variant="ghost" size="icon-sm" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
