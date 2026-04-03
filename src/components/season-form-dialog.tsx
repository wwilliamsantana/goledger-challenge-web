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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { TvShow, Season } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  season: Season | null;
  show: TvShow;
  onSuccess: () => void;
}

export function SeasonFormDialog({ open, onOpenChange, season, show, onSuccess }: Props) {
  const isEdit = !!season;
  const [number, setNumber] = useState("");
  const [year, setYear] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    if (season) {
      setNumber(String(season.number));
      setYear(String(season.year));
    } else {
      setNumber("");
      setYear("");
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
              "@assetType": "seasons",
              number: season.number,
              tvShow: { "@assetType": "tvShows", title: show.title },
              year: Number(year),
            },
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Temporada atualizada");
      } else {
        const res = await fetch("/api/invoke/createAsset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            asset: [
              {
                "@assetType": "seasons",
                number: Number(number),
                year: Number(year),
                tvShow: { "@assetType": "tvShows", title: show.title },
              },
            ],
          }),
        });
        if (!res.ok) throw new Error();
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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) resetForm();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Temporada" : "Nova Temporada"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              type="number"
              min={1}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={isEdit}
              required
              placeholder="Ex: 1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Ano de Lançamento</Label>
            <Input
              id="year"
              type="number"
              min={1900}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              placeholder="Ex: 2008"
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
