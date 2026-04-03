"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { TvShow, Season, Episode } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episode: Episode | null;
  show: TvShow;
  season: Season;
  onSuccess: () => void;
}

export function EpisodeFormDialog({ open, onOpenChange, episode, show, season, onSuccess }: Props) {
  const isEdit = !!episode;
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [rating, setRating] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    if (episode) {
      setEpisodeNumber(String(episode.episodeNumber));
      setTitle(episode.title);
      setDescription(episode.description);
      setReleaseDate(episode.releaseDate.split("T")[0]);
      setRating(episode.rating != null ? String(episode.rating) : "");
    } else {
      setEpisodeNumber("");
      setTitle("");
      setDescription("");
      setReleaseDate("");
      setRating("");
    }
  };

  const seasonRef = {
    "@assetType": "seasons" as const,
    number: season.number,
    tvShow: { "@assetType": "tvShows" as const, title: show.title },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dateISO = new Date(releaseDate + "T00:00:00Z").toISOString();

      if (isEdit) {
        const updatePayload: Record<string, unknown> = {
          "@assetType": "episodes",
          episodeNumber: episode.episodeNumber,
          season: seasonRef,
          title,
          description,
          releaseDate: dateISO,
        };
        if (rating) updatePayload.rating = Number(rating);
        const res = await fetch("/api/invoke/updateAsset", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ update: updatePayload }),
        });
        if (!res.ok) throw new Error();
        toast.success("Episódio atualizado");
      } else {
        const createPayload: Record<string, unknown> = {
          "@assetType": "episodes",
          episodeNumber: Number(episodeNumber),
          season: seasonRef,
          title,
          description,
          releaseDate: dateISO,
        };
        if (rating) createPayload.rating = Number(rating);
        const res = await fetch("/api/invoke/createAsset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asset: [createPayload] }),
        });
        if (!res.ok) throw new Error();
        toast.success("Episódio criado");
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao salvar episódio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) resetForm();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Episódio" : "Novo Episódio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="epNumber">Número do Episódio</Label>
            <Input
              id="epNumber"
              type="number"
              min={1}
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              disabled={isEdit}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="epTitle">Título</Label>
            <Input
              id="epTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Pilot"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="epDesc">Descrição</Label>
            <Textarea
              id="epDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="epDate">Data de Lançamento</Label>
              <Input
                id="epDate"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epRating">Nota (opcional)</Label>
              <Input
                id="epRating"
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="0 - 10"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
