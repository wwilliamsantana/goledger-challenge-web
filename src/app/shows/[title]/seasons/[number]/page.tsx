"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import type { TvShow, Season, Episode } from "@/lib/types";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { EpisodeFormDialog } from "@/components/episode-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { HistoryDialog } from "@/components/history-dialog";

export default function SeasonDetailPage() {
  const params = useParams();
  const showTitle = decodeURIComponent(params.title as string);
  const seasonNumber = Number(params.number);

  const [show, setShow] = useState<TvShow | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Episode | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch show
      const showRes = await fetch("/api/query/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: { selector: { "@assetType": "tvShows", title: showTitle } } }),
      });
      const showData = await showRes.json();
      const foundShow = showData.result?.[0] as TvShow | undefined;
      setShow(foundShow || null);

      if (!foundShow) return;

      // Fetch season
      const seasonRes = await fetch("/api/query/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: {
            selector: {
              "@assetType": "seasons",
              number: seasonNumber,
              tvShow: { "@assetType": "tvShows", "@key": foundShow["@key"] },
            },
          },
        }),
      });
      const seasonData = await seasonRes.json();
      const foundSeason = seasonData.result?.[0] as Season | undefined;
      setSeason(foundSeason || null);

      if (!foundSeason) return;

      // Fetch episodes
      const epRes = await fetch("/api/query/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: {
            selector: {
              "@assetType": "episodes",
              season: { "@assetType": "seasons", "@key": foundSeason["@key"] },
            },
          },
        }),
      });
      const epData = await epRes.json();
      const sorted = (epData.result || []).sort(
        (a: Episode, b: Episode) => a.episodeNumber - b.episodeNumber
      );
      setEpisodes(sorted);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [showTitle, seasonNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget || !show || !season) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/invoke/deleteAsset", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: {
            "@assetType": "episodes",
            episodeNumber: deleteTarget.episodeNumber,
            season: {
              "@assetType": "seasons",
              number: season.number,
              tvShow: { "@assetType": "tvShows", title: show.title },
            },
          },
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Episódio ${deleteTarget.episodeNumber} removido`);
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Erro ao deletar episódio");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!show || !season) {
    return <div className="text-center py-20 text-muted-foreground">Dados não encontrados.</div>;
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: show.title, href: `/shows/${encodeURIComponent(show.title)}` },
          { label: `Temporada ${season.number}` },
        ]}
      />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {show.title} — Temporada {season.number}
          </h1>
          <p className="text-muted-foreground mt-1">Ano: {season.year}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" /> Histórico
          </Button>
          <Button size="sm" onClick={() => { setEditingEpisode(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Episódio
          </Button>
        </div>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Nenhum episódio cadastrado.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.map((ep) => (
            <Card key={ep["@key"]} className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Episódio {ep.episodeNumber}</p>
                  <CardTitle className="text-base leading-snug">{ep.title}</CardTitle>
                </div>
                {ep.rating != null && (
                  <Badge variant="secondary">⭐ {ep.rating}</Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{ep.description}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(ep.releaseDate).toLocaleDateString("pt-BR")}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setEditingEpisode(ep); setFormOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
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
        onSuccess={fetchData}
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
    </>
  );
}
