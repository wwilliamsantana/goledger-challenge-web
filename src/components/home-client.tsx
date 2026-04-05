"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import type { TvShow } from "@/lib/types";
import { TvShowFormDialog } from "@/components/tv-show-form-dialog";
import { DeleteShowDialog } from "@/components/cascade-delete-dialog";
import { HeroSection } from "@/components/hero-section";
import { ScrollCatalog } from "@/components/scroll-catalog";
import { HistorySidebar } from "@/components/history-sidebar";

interface HomeClientProps {
  initialShows: TvShow[];
}

export function HomeClient({ initialShows }: HomeClientProps) {
  const [shows, setShows] = useState<TvShow[]>(initialShows);
  const [formOpen, setFormOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<TvShow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TvShow | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAssetKey, setHistoryAssetKey] = useState<Record<string, unknown> | null>(null);
  const [historyAssetLabel, setHistoryAssetLabel] = useState("");

  const catalogRef = useRef<HTMLDivElement>(null);

  const handleEdit = useCallback((show: TvShow) => {
    setEditingShow(show);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((show: TvShow) => {
    setDeleteTarget(show);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingShow(null);
    setFormOpen(true);
  }, []);

  const refreshShows = useCallback(async () => {
    try {
      const { data } = await api.post("/query/search", {
        query: { selector: { "@assetType": "tvShows" } },
      });
      setShows(data.result || []);
    } catch {
      toast.error("Erro ao carregar séries");
    }
  }, []);

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
        <ScrollCatalog
          shows={shows}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHistory={handleHistory}
          onAdd={handleAdd}
        />
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
        onSuccess={refreshShows}
      />

      <DeleteShowDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        show={deleteTarget}
        onSuccess={refreshShows}
      />
    </div>
  );
}
