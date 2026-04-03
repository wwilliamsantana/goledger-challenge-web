"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import api from "@/lib/axios";
import type { TvShow, Season } from "@/lib/types";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { SeasonFormDialog } from "@/components/season-form-dialog";
import { DeleteSeasonDialog } from "@/components/cascade-delete-dialog";
import { HistoryDialog } from "@/components/history-dialog";

export default function ShowDetailPage() {
  const params = useParams();
  const showTitle = decodeURIComponent(params.title as string);

  const [show, setShow] = useState<TvShow | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Season | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: showData } = await api.post("/query/search", {
        query: { selector: { "@assetType": "tvShows", title: showTitle } },
      });
      const foundShow = showData.result?.[0] as TvShow | undefined;
      setShow(foundShow || null);

      if (foundShow) {
        const { data: seasonsData } = await api.post("/query/search", {
          query: {
            selector: {
              "@assetType": "seasons",
              tvShow: { "@assetType": "tvShows", "@key": foundShow["@key"] },
            },
          },
        });
        const sorted = (seasonsData.result || []).sort(
          (a: Season, b: Season) => a.number - b.number
        );
        setSeasons(sorted);
      }
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [showTitle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-1/3" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!show) {
    return <div className="text-center py-20 text-muted-foreground">Série não encontrada.</div>;
  }

  return (
    <>
      <AppBreadcrumb items={[{ label: show.title }]} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {show.title}
            <Badge variant="secondary">{show.recommendedAge}+</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">{show.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" /> Histórico
          </Button>
          <Button size="sm" onClick={() => { setEditingSeason(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Temporada
          </Button>
        </div>
      </div>

      {seasons.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Nenhuma temporada cadastrada.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seasons.map((season) => (
            <Card key={season["@key"]} className="group relative hover:border-primary/50 transition-colors">
              <Link
                href={`/shows/${encodeURIComponent(show.title)}/seasons/${season.number}`}
                className="absolute inset-0 z-0"
              />
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Temporada {season.number}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Ano: {season.year}</p>
                <div className="flex gap-1 relative z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); setEditingSeason(season); setFormOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => { e.preventDefault(); setDeleteTarget(season); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SeasonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        season={editingSeason}
        show={show}
        onSuccess={fetchData}
      />

      {show && (
        <DeleteSeasonDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          season={deleteTarget}
          show={show}
          onSuccess={fetchData}
        />
      )}

      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        assetKey={{ "@assetType": "tvShows", title: show.title }}
        assetLabel={show.title}
      />
    </>
  );
}
