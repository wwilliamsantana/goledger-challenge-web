
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { TvShow } from "@/lib/types";
import { TvShowFormDialog } from "@/components/tv-show-form-dialog";
import { DeleteShowDialog } from "@/components/cascade-delete-dialog";
import { HeroSection } from "@/components/hero-section";
import { ScrollCatalog } from "@/components/scroll-catalog";
import { HistorySidebar } from "@/components/history-sidebar";

export default function Home() {
  const [shows, setShows] = useState<TvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<TvShow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TvShow | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAssetKey, setHistoryAssetKey] = useState<Record<string, unknown> | null>(null);
  const [historyAssetLabel, setHistoryAssetLabel] = useState("");

  const catalogRef = useRef<HTMLDivElement>(null);

  const fetchShows = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/query/search", {
        query: { selector: { "@assetType": "tvShows" } },
      });
      setShows(data.result || []);
    } catch {
      toast.error("Erro ao carregar séries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const handleExplore = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleHistory = (show: TvShow) => {
    setHistoryAssetKey({ "@assetType": "tvShows", title: show.title });
    setHistoryAssetLabel(show.title);
    setHistoryOpen(true);
  };

  return (
    <div className="-mx-4 -mt-8">
      <HeroSection onExplore={handleExplore} />

      <div ref={catalogRef}>
        {loading ? (
          <section className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-muted-foreground text-sm">Carregando catálogo...</p>
            </div>
          </section>
        ) : (
          <ScrollCatalog
            shows={shows}
            onEdit={(show) => { setEditingShow(show); setFormOpen(true); }}
            onDelete={(show) => setDeleteTarget(show)}
            onHistory={handleHistory}
            onAdd={() => { setEditingShow(null); setFormOpen(true); }}
          />
        )}
      </div>

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        assetKey={historyAssetKey}
        assetLabel={historyAssetLabel}
      />

      <TvShowFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        show={editingShow}
        onSuccess={fetchShows}
      />

      <DeleteShowDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        show={deleteTarget}
        onSuccess={fetchShows}
      />
    </div>
  );
}
