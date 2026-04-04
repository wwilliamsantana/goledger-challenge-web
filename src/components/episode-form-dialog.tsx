"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import api from "@/lib/axios";
import type { TvShow, Season, Episode } from "@/lib/types";

const episodeSchema = z.object({
  episodeNumber: z
    .string()
    .min(1, "Número do episódio é obrigatório")
    .refine((v) => !isNaN(Number(v)), "Informe um número válido")
    .refine((v) => Number.isInteger(Number(v)), "Deve ser um número inteiro")
    .refine((v) => Number(v) >= 1, "Deve ser no mínimo 1"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  releaseDate: z.string().min(1, "Data de lançamento é obrigatória"),
  rating: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 10), "Nota deve ser entre 0 e 10"),
});

type EpisodeFormData = z.infer<typeof episodeSchema>;

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
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EpisodeFormData>({
    resolver: zodResolver(episodeSchema),
  });

  useEffect(() => {
    if (!open) return;
    if (episode) {
      reset({
        episodeNumber: String(episode.episodeNumber),
        title: episode.title,
        description: episode.description,
        releaseDate: episode.releaseDate.split("T")[0],
        rating: episode.rating != null ? String(episode.rating) : "",
      });
    } else {
      reset({
        episodeNumber: "",
        title: "",
        description: "",
        releaseDate: "",
        rating: "",
      });
    }
  }, [open, episode, reset]);

  const seasonRef = {
    "@assetType": "seasons" as const,
    number: season.number,
    tvShow: { "@assetType": "tvShows" as const, title: show.title },
  };

  const onSubmit = async (data: EpisodeFormData) => {
    setSaving(true);
    try {
      const dateISO = new Date(data.releaseDate + "T00:00:00Z").toISOString();
      const ratingValue = data.rating ? Number(data.rating) : undefined;

      if (isEdit) {
        const updatePayload: Record<string, unknown> = {
          "@assetType": "episodes",
          episodeNumber: episode.episodeNumber,
          season: seasonRef,
          title: data.title,
          description: data.description,
          releaseDate: dateISO,
        };
        if (ratingValue != null) updatePayload.rating = ratingValue;
        await api.put("/invoke/updateAsset", { update: updatePayload });
        toast.success("Episódio atualizado");
      } else {
        const createPayload: Record<string, unknown> = {
          "@assetType": "episodes",
          episodeNumber: Number(data.episodeNumber),
          season: seasonRef,
          title: data.title,
          description: data.description,
          releaseDate: dateISO,
        };
        if (ratingValue != null) createPayload.rating = ratingValue;
        await api.post("/invoke/createAsset", { asset: [createPayload] });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Episódio" : "Novo Episódio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="epNumber">Número do Episódio</Label>
            <Input
              id="epNumber"
              type="number"
              min={1}
              {...register("episodeNumber")}
              disabled={isEdit}
            />
            {errors.episodeNumber && <p className="text-sm text-destructive">{errors.episodeNumber.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="epTitle">Título</Label>
            <Input
              id="epTitle"
              {...register("title")}
              placeholder="Ex: Pilot"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="epDesc">Descrição</Label>
            <Textarea
              id="epDesc"
              {...register("description")}
              rows={3}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="epDate">Data de Lançamento</Label>
              <Input
                id="epDate"
                type="date"
                {...register("releaseDate")}
              />
              {errors.releaseDate && <p className="text-sm text-destructive">{errors.releaseDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="epRating">Nota (opcional)</Label>
              <Input
                id="epRating"
                type="number"
                min={0}
                max={10}
                step={0.1}
                {...register("rating")}
                placeholder="0 - 10"
              />
              {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
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
