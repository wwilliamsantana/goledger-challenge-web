"use client";

import { useEffect, useState, startTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetKey: Record<string, unknown>;
  assetLabel: string;
}

export function HistoryDialog({ open, onOpenChange, assetKey, assetLabel }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    startTransition(() => setLoading(true));
    api
      .post("/query/readAssetHistory", { key: assetKey })
      .then(({ data }) => setEntries(Array.isArray(data) ? data : data.result || []))
      .catch(() => toast.error("Erro ao carregar histórico"))
      .finally(() => setLoading(false));
  }, [open, assetKey]);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
    });
  };

  const getEventType = (entry: HistoryEntry, index: number, total: number) => {
    if (entry._isDelete) return "Excluído";
    if (index === total - 1) return "Criado";
    return "Editado";
  };

  const getBadgeVariant = (type: string) => {
    if (type === "Criado") return "default" as const;
    if (type === "Excluído") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico — {assetLabel}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Nenhum histórico encontrado.</p>
        ) : (
          <div className="relative pl-6 space-y-0">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {entries.map((entry, i) => {
              const type = getEventType(entry, i, entries.length);
              return (
                <div key={entry._txId + i} className="relative pb-6 last:pb-0">
                  <div className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getBadgeVariant(type)} className="text-xs">
                      {type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry._timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    TX: {entry._txId}
                  </p>
                  {i < entries.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
