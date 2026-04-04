"use client";

import { startTransition, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { HistoryEntry } from "@/lib/types";

interface HistorySidebarProps {
  open: boolean;
  onClose: () => void;
  assetKey: Record<string, unknown> | null;
  assetLabel: string;
}

export function HistorySidebar({ open, onClose, assetKey, assetLabel }: HistorySidebarProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !assetKey) return;
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-70 w-full max-w-md bg-card/95 backdrop-blur-2xl border-r border-border/50 shadow-2xl shadow-black/40 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary/70 mb-1">Blockchain History</p>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{assetLabel}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Timeline content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loading ? (
                <div className="space-y-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-3 h-3 rounded-full shrink-0 mt-1" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">Nenhum histórico encontrado.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1.25 top-3 bottom-3 w-px bg-linear-to-b from-primary/50 via-border/50 to-transparent" />

                  {/* Timeline entries */}
                  <div className="space-y-8">
                    {entries.map((entry, i) => {
                      const type = getEventType(entry, i, entries.length);
                      const isCreated = type === "Criado";
                      const isDeleted = type === "Excluído";

                      return (
                        <motion.div
                          key={entry._txId + i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.4 }}
                          className="relative flex gap-4 group"
                        >
                          {/* Timeline dot */}
                          <div className="relative shrink-0 mt-1.5">
                            <div
                              className={`w-2.75 h-2.75 rounded-full border-2 ${isCreated
                                ? "bg-primary border-primary shadow-sm shadow-primary/50"
                                : isDeleted
                                  ? "bg-destructive border-destructive"
                                  : "bg-card border-muted-foreground/40 group-hover:border-primary/60"
                                } transition-colors duration-300`}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-2">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge
                                variant={isCreated ? "default" : isDeleted ? "destructive" : "secondary"}
                                className={`text-[10px] px-2 py-0 ${isCreated ? "bg-primary/20 text-primary border-primary/30" : ""
                                  }`}
                              >
                                {type}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground/60">
                                {formatDate(entry._timestamp)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground/50 font-mono truncate leading-relaxed">
                              TX: {entry._txId}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/30">
              <p className="text-[11px] text-muted-foreground/40 text-center">
                Dados imutáveis registrados na Hyperledger Fabric
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
