
"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { TvShow } from "@/lib/types";
import { TvShowFormDialog } from "@/components/tv-show-form-dialog";
import { DeleteShowDialog } from "@/components/cascade-delete-dialog";

export default function Home() {
  const [shows, setShows] = useState<TvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<TvShow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TvShow | null>(null);

  const fetchShows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/query/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: { selector: { "@assetType": "tvShows" } } }),
      });
      const data = await res.json();
      setShows(data.result || []);
    } catch {
      toast.error("Erro ao carregar séries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">TV Shows</h1>
        <Button onClick={() => { setEditingShow(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova Série
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : shows.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Nenhuma série cadastrada. Clique em &quot;Nova Série&quot; para começar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shows.map((show) => (
            <Card key={show["@key"]} className="group relative hover:border-primary/50 transition-colors">
              <Link href={`/shows/${encodeURIComponent(show.title)}`} className="absolute inset-0 z-0" />
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">{show.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0">{show.recommendedAge}+</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{show.description}</p>
                <div className="flex gap-1 relative z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); setEditingShow(show); setFormOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => { e.preventDefault(); setDeleteTarget(show); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TvShowFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        show={editingShow}
        onSuccess={fetchShows}
      />

      <DeleteShowDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        show={deleteTarget}
        onSuccess={fetchShows}
      />
    </>
  );
}
