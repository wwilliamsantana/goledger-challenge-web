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
import type { TvShow } from "@/lib/types";

const tvShowSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  recommendedAge: z
    .string()
    .min(1, "Classificação indicativa é obrigatória")
    .refine((v) => !isNaN(Number(v)), "Informe um número válido")
    .refine((v) => Number.isInteger(Number(v)), "Deve ser um número inteiro")
    .refine((v) => Number(v) >= 0, "Deve ser no mínimo 0"),
});

type TvShowFormData = z.infer<typeof tvShowSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: TvShow | null;
  onSuccess: () => void;
}

export function TvShowFormDialog({ open, onOpenChange, show, onSuccess }: Props) {
  const isEdit = !!show;
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TvShowFormData>({
    resolver: zodResolver(tvShowSchema),
  });

  useEffect(() => {
    if (!open) return;
    if (show) {
      reset({
        title: show.title,
        description: show.description,
        recommendedAge: String(show.recommendedAge),
      });
    } else {
      reset({ title: "", description: "", recommendedAge: "" });
    }
  }, [open, show, reset]);

  const onSubmit = async (data: TvShowFormData) => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.put("/invoke/updateAsset", {
          update: {
            "@assetType": "tvShows",
            title: show.title,
            description: data.description,
            recommendedAge: Number(data.recommendedAge),
          },
        });
        toast.success("Série atualizada");
      } else {
        await api.post("/invoke/createAsset", {
          asset: [
            {
              "@assetType": "tvShows",
              title: data.title,
              description: data.description,
              recommendedAge: Number(data.recommendedAge),
            },
          ],
        });
        toast.success("Série criada");
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao salvar série");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Série" : "Nova Série"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              {...register("title")}
              disabled={isEdit}
              placeholder="Ex: Breaking Bad"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={3}
              placeholder="Sinopse da série"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Classificação Indicativa</Label>
            <Input
              id="age"
              type="number"
              min={0}
              {...register("recommendedAge")}
              placeholder="Ex: 16"
            />
            {errors.recommendedAge && <p className="text-sm text-destructive">{errors.recommendedAge.message}</p>}
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
