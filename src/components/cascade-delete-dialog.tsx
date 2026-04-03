"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { TvShow, Season, Episode } from "@/lib/types";

async function searchAssets(selector: Record<string, unknown>) {
  const res = await fetch("/api/query/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: { selector } }),
  });
  const data = await res.json();
  return data.result || [];
}

async function deleteAsset(key: Record<string, unknown>) {
  const res = await fetch("/api/invoke/deleteAsset", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro ao deletar");
  }
}

// ─── Delete TV Show (cascade: episodes → seasons → show) ───

interface DeleteShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: TvShow | null;
  onSuccess: () => void;
}

export function DeleteShowDialog({ open, onOpenChange, show, onSuccess }: DeleteShowDialogProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState("");

  const fetchChildren = useCallback(async () => {
    if (!show) return;
    setLoadingChildren(true);
    try {
      const foundSeasons: Season[] = await searchAssets({
        "@assetType": "seasons",
        tvShow: { "@assetType": "tvShows", "@key": show["@key"] },
      });
      setSeasons(foundSeasons);

      const allEpisodes: Episode[] = [];
      for (const season of foundSeasons) {
        const eps: Episode[] = await searchAssets({
          "@assetType": "episodes",
          season: { "@assetType": "seasons", "@key": season["@key"] },
        });
        allEpisodes.push(...eps);
      }
      setEpisodes(allEpisodes);
    } catch {
      toast.error("Erro ao verificar dependências");
    } finally {
      setLoadingChildren(false);
    }
  }, [show]);

  useEffect(() => {
    if (open && show) {
      setSeasons([]);
      setEpisodes([]);
      setProgress("");
      fetchChildren();
    }
  }, [open, show, fetchChildren]);

  const handleConfirm = async () => {
    if (!show) return;
    setDeleting(true);
    try {
      // Build a map from season @key to season number for episode deletion
      const seasonByKey = new Map(seasons.map((s) => [s["@key"], s]));

      // 1. Delete all episodes
      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        const parentSeason = seasonByKey.get(ep.season["@key"]);
        if (!parentSeason) continue;
        setProgress(`Removendo episódio ${i + 1}/${episodes.length}...`);
        await deleteAsset({
          "@assetType": "episodes",
          episodeNumber: ep.episodeNumber,
          season: {
            "@assetType": "seasons",
            number: parentSeason.number,
            tvShow: { "@assetType": "tvShows", title: show.title },
          },
        });
      }

      // 2. Delete all seasons
      for (let i = 0; i < seasons.length; i++) {
        const s = seasons[i];
        setProgress(`Removendo temporada ${i + 1}/${seasons.length}...`);
        await deleteAsset({
          "@assetType": "seasons",
          number: s.number,
          tvShow: { "@assetType": "tvShows", title: show.title },
        });
      }

      // 3. Delete the show
      setProgress("Removendo série...");
      await deleteAsset({ "@assetType": "tvShows", title: show.title });

      toast.success(`"${show.title}" e todos os dados relacionados foram removidos`);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro durante a exclusão em cascata");
    } finally {
      setDeleting(false);
      setProgress("");
    }
  };

  const hasChildren = seasons.length > 0 || episodes.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !deleting && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasChildren && !loadingChildren && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            Excluir série
          </DialogTitle>
          <DialogDescription>
            {loadingChildren
              ? "Verificando dependências..."
              : hasChildren
                ? `"${show?.title}" possui dados vinculados que serão excluídos juntos:`
                : `Tem certeza que deseja excluir "${show?.title}"? Esta ação não pode ser desfeita.`}
          </DialogDescription>
        </DialogHeader>

        {loadingChildren ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : hasChildren ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2 text-sm">
            {seasons.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{seasons.length}</Badge>
                <span>temporada{seasons.length > 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">
                  ({seasons.map((s) => `T${s.number}`).join(", ")})
                </span>
              </div>
            )}
            {episodes.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{episodes.length}</Badge>
                <span>episódio{episodes.length > 1 ? "s" : ""}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Todos os itens acima serão permanentemente removidos.
            </p>
          </div>
        ) : null}

        {deleting && progress && (
          <p className="text-sm text-muted-foreground animate-pulse">{progress}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting || loadingChildren}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasChildren ? "Excluir tudo" : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Season (cascade: episodes → season) ───

interface DeleteSeasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  season: Season | null;
  show: TvShow;
  onSuccess: () => void;
}

export function DeleteSeasonDialog({
  open,
  onOpenChange,
  season,
  show,
  onSuccess,
}: DeleteSeasonDialogProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState("");

  const fetchChildren = useCallback(async () => {
    if (!season) return;
    setLoadingChildren(true);
    try {
      const eps: Episode[] = await searchAssets({
        "@assetType": "episodes",
        season: { "@assetType": "seasons", "@key": season["@key"] },
      });
      setEpisodes(eps.sort((a, b) => a.episodeNumber - b.episodeNumber));
    } catch {
      toast.error("Erro ao verificar dependências");
    } finally {
      setLoadingChildren(false);
    }
  }, [season]);

  useEffect(() => {
    if (open && season) {
      setEpisodes([]);
      setProgress("");
      fetchChildren();
    }
  }, [open, season, fetchChildren]);

  const handleConfirm = async () => {
    if (!season) return;
    setDeleting(true);
    try {
      // 1. Delete all episodes
      for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        setProgress(`Removendo episódio ${i + 1}/${episodes.length}...`);
        await deleteAsset({
          "@assetType": "episodes",
          episodeNumber: ep.episodeNumber,
          season: {
            "@assetType": "seasons",
            number: season.number,
            tvShow: { "@assetType": "tvShows", title: show.title },
          },
        });
      }

      // 2. Delete season
      setProgress("Removendo temporada...");
      await deleteAsset({
        "@assetType": "seasons",
        number: season.number,
        tvShow: { "@assetType": "tvShows", title: show.title },
      });

      toast.success(`Temporada ${season.number} e seus episódios foram removidos`);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro durante a exclusão em cascata");
    } finally {
      setDeleting(false);
      setProgress("");
    }
  };

  const hasChildren = episodes.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !deleting && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasChildren && !loadingChildren && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            Excluir temporada
          </DialogTitle>
          <DialogDescription>
            {loadingChildren
              ? "Verificando dependências..."
              : hasChildren
                ? `A Temporada ${season?.number} possui episódios que serão excluídos juntos:`
                : `Tem certeza que deseja excluir a Temporada ${season?.number}?`}
          </DialogDescription>
        </DialogHeader>

        {loadingChildren ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : hasChildren ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{episodes.length}</Badge>
              <span>episódio{episodes.length > 1 ? "s" : ""}</span>
            </div>
            <ul className="text-xs text-muted-foreground list-disc list-inside mt-1 max-h-32 overflow-y-auto">
              {episodes.map((ep) => (
                <li key={ep["@key"]}>
                  Ep. {ep.episodeNumber} — {ep.title}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Todos os episódios serão permanentemente removidos.
            </p>
          </div>
        ) : null}

        {deleting && progress && (
          <p className="text-sm text-muted-foreground animate-pulse">{progress}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting || loadingChildren}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasChildren ? "Excluir tudo" : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
