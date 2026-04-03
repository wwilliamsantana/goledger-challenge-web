"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, History, Calendar, Layers } from "lucide-react";
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
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardHeader><Skeleton className="h-5 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-1/3" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
          <Layers className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-lg">Série não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-16">
      <AppBreadcrumb items={[{ label: show.title }]} />

      <div className="relative mb-10 animate-fade-in">
        <div className="absolute -top-16 left-0 w-[400px] h-[200px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <span className="gradient-text">{show.title}</span>
              <Badge variant="secondary" className="bg-secondary/80 text-xs">{show.recommendedAge}+</Badge>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{show.description}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              <History className="mr-2 h-4 w-4" /> Histórico
            </Button>
            <Button
              size="sm"
              onClick={() => { setEditingSeason(null); setFormOpen(true); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/40"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Temporada
            </Button>
          </div>
        </div>
      </div>

      {seasons.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">Nenhuma temporada cadastrada.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
          {seasons.map((season) => (
            <Card
              key={season["@key"]}
              className="group relative bg-card/60 border-border/40 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <Link
                href={`/shows/${encodeURIComponent(show.title)}/seasons/${season.number}`}
                className="absolute inset-0 z-0"
              />
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Temporada {season.number}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {season.year}
                </p>
                <div className="flex gap-1 relative z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                    onClick={(e) => { e.preventDefault(); setEditingSeason(season); setFormOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
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
    </div>
  );
}
