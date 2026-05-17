"use client";

import Link from "next/link";
import { useState } from "react";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useSetlistStore } from "@/stores/setlist-store";
import { toast } from "sonner";

export default function SetsPage() {
  const { setlists, create, remove } = useSetlistStore();
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const setlist = await create({ name: newName.trim(), items: [] });
    setNewName("");
    setOpen(false);
    toast.success("Setlist created");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Setlists</h1>
          <p className="text-muted-foreground">Organize songs for live worship</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className={cn(buttonVariants())}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Setlist
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Setlist</DialogTitle>
            </DialogHeader>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Sunday Worship Set"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} className="mt-2 w-full">
              Create
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {setlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No setlists yet"
          description="Create a setlist for your next worship service."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Setlist
            </Button>
          }
        />
      ) : (
        <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {setlists.map((setlist, i) => (
            <motion.div
              key={setlist.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <Link href={`/sets/${setlist.id}`}>
                    <h3 className="font-semibold hover:text-amber-500">
                      {setlist.name}
                    </h3>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={async () => {
                      await remove(setlist.id);
                      toast.success("Setlist deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {setlist.items.length} songs
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/sets/${setlist.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/sets/${setlist.id}/perform`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        setlist.items.length === 0 && "pointer-events-none opacity-50"
                      )}
                    >
                      Perform
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
