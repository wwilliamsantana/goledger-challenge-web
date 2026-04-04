"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, History, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { TvShow, Season, Episode } from "@/lib/types";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { EpisodeFormDialog } from "@/components/episode-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { HistoryDialog } from "@/components/history-dialog";

interface SeasonDetailClientProps {
  show: TvShow;
  season: Season;
  initialEpisodes: Episode[];
}

export function SeasonDetailClient({ show, season, initialEpisodes }: SeasonDetailClientProps) {
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Episode | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const refreshEpisodes = useCallback(async () => {
    try {
      const { data: epData } = await api.post("/query/search", {
        query: {
          selector: {
            "@assetType": "episodes",
            season: { "@assetType": "seasons", "@key": season["@key"] },
          },
        },
      });
      const sorted = (epData.result || []).sort(
        (a: Episode, b: Episode) => a.episodeNumber - b.episodeNumber
      );
      setEpisodes(sorted);
    } catch {
      toast.error("Erro ao carregar episódios");
    }
  }, [season]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete("/invoke/deleteAsset", {
        data: {
          key: {
            "@assetType": "episodes",
            episodeNumber: deleteTarget.episodeNumber,
            season: {
              "@assetType": "seasons",
              number: season.number,
              tvShow: { "@assetType": "tvShows", title: show.title },
            },
          },
        },
      });
      toast.success(`Episódio ${deleteTarget.episodeNumber} removido`);
      setDeleteTarget(null);
      refreshEpisodes();
    } catch {
      toast.error("Erro ao deletar episódio");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto pt-16">
      <AppBreadcrumb
        items={[
          { label: show.title, href: `/shows/${encodeURIComponent(show.title)}` },
          { label: `Temporada ${season.number}` },
        ]}
      />

      <div className="relative mb-10 animate-fade-in">
        <div className="absolute -top-16 left-0 w-100 h-50 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="gradient-text">{show.title}</span>
              <span className="text-foreground/60"> — Temporada {season.number}</span>
            </h1>
            <p className="text-muted-foreground mt-2">Ano: {season.year}</p>
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
              onClick={() => { setEditingEpisode(null); setFormOpen(true); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/40"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Episódio
            </Button>
          </div>
        </div>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <PlayCircle className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">Nenhum episódio cadastrado.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
          {episodes.map((ep) => (
            <Card
              key={ep["@key"]}
              className="group bg-card/60 border-border/40 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div className="flex items-start gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 shrink-0 mt-0.5">
                    <PlayCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Episódio {ep.episodeNumber}</p>
                    <CardTitle className="text-base leading-snug">{ep.title}</CardTitle>
                  </div>
                </div>
                {ep.rating != null && (
                  <Badge variant="secondary" className="bg-secondary/80 text-xs shrink-0">⭐ {ep.rating}</Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{ep.description}</p>
                <p className="text-xs text-muted-foreground/60 mb-4">
                  {new Date(ep.releaseDate).toLocaleDateString("pt-BR")}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                    onClick={() => { setEditingEpisode(ep); setFormOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    onClick={() => setDeleteTarget(ep)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EpisodeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        episode={editingEpisode}
        show={show}
        season={season}
        onSuccess={refreshEpisodes}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir episódio"
        description={`Tem certeza que deseja excluir o Episódio ${deleteTarget?.episodeNumber} — "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <HistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        assetKey={{
          "@assetType": "seasons",
          number: season.number,
          tvShow: { "@assetType": "tvShows", title: show.title },
        }}
        assetLabel={`Temporada ${season.number}`}
      />
    </div>
  );
}
