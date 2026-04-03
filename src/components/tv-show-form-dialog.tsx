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
import type { TvShow } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: TvShow | null;
  onSuccess: () => void;
}

export function TvShowFormDialog({ open, onOpenChange, show, onSuccess }: Props) {
  const isEdit = !!show;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recommendedAge, setRecommendedAge] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    if (show) {
      setTitle(show.title);
      setDescription(show.description);
      setRecommendedAge(String(show.recommendedAge));
    } else {
      setTitle("");
      setDescription("");
      setRecommendedAge("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        const res = await fetch("/api/invoke/updateAsset", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            update: {
              "@assetType": "tvShows",
              title: show.title,
              description,
              recommendedAge: Number(recommendedAge),
            },
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Série atualizada");
      } else {
        const res = await fetch("/api/invoke/createAsset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            asset: [
              {
                "@assetType": "tvShows",
                title,
                description,
                recommendedAge: Number(recommendedAge),
              },
            ],
          }),
        });
        if (!res.ok) throw new Error();
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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) resetForm();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Série" : "Nova Série"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isEdit}
              required
              placeholder="Ex: Breaking Bad"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Sinopse da série"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Classificação Indicativa</Label>
            <Input
              id="age"
              type="number"
              min={0}
              value={recommendedAge}
              onChange={(e) => setRecommendedAge(e.target.value)}
              required
              placeholder="Ex: 16"
            />
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
