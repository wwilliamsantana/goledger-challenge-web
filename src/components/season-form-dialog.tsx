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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { TvShow, Season } from "@/lib/types";

const seasonSchema = z.object({
  number: z
    .string()
    .min(1, "Número é obrigatório")
    .refine((v) => !isNaN(Number(v)), "Informe um número válido")
    .refine((v) => Number.isInteger(Number(v)), "Deve ser um número inteiro")
    .refine((v) => Number(v) >= 1, "Deve ser no mínimo 1"),
  year: z
    .string()
    .min(1, "Ano é obrigatório")
    .refine((v) => !isNaN(Number(v)), "Informe um ano válido")
    .refine((v) => Number.isInteger(Number(v)), "Deve ser um número inteiro")
    .refine((v) => Number(v) >= 1900, "Ano deve ser no mínimo 1900"),
});

type SeasonFormData = z.infer<typeof seasonSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  season: Season | null;
  show: TvShow;
  onSuccess: () => void;
}

export function SeasonFormDialog({ open, onOpenChange, season, show, onSuccess }: Props) {
  const isEdit = !!season;
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SeasonFormData>({
    resolver: zodResolver(seasonSchema),
  });

  useEffect(() => {
    if (!open) return;
    if (season) {
      reset({ number: String(season.number), year: String(season.year) });
    } else {
      reset({ number: "", year: "" });
    }
  }, [open, season, reset]);

  const onSubmit = async (data: SeasonFormData) => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.put("/invoke/updateAsset", {
          update: {
            "@assetType": "seasons",
            number: season.number,
            tvShow: { "@assetType": "tvShows", title: show.title },
            year: Number(data.year),
          },
        });
        toast.success("Temporada atualizada");
      } else {
        await api.post("/invoke/createAsset", {
          asset: [
            {
              "@assetType": "seasons",
              number: Number(data.number),
              year: Number(data.year),
              tvShow: { "@assetType": "tvShows", title: show.title },
            },
          ],
        });
        toast.success("Temporada criada");
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao salvar temporada");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Temporada" : "Nova Temporada"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              type="number"
              min={1}
              {...register("number")}
              disabled={isEdit}
              placeholder="Ex: 1"
            />
            {errors.number && <p className="text-sm text-destructive">{errors.number.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Ano de Lançamento</Label>
            <Input
              id="year"
              type="number"
              min={1900}
              {...register("year")}
              placeholder="Ex: 2008"
            />
            {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
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
