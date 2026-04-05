"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, History, ArrowRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import type { TvShow } from "@/lib/types";

interface ShowCardProps {
  show: TvShow;
  index: number;
  onEdit: (show: TvShow) => void;
  onDelete: (show: TvShow) => void;
  onHistory: (show: TvShow) => void;
}

interface ScrollCatalogProps {
  shows: TvShow[];
  onEdit: (show: TvShow) => void;
  onDelete: (show: TvShow) => void;
  onHistory: (show: TvShow) => void;
  onAdd: () => void;
}

const ShowCard = memo(function ShowCard({ show, index, onEdit, onDelete, onHistory }: ShowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-6 shadow-lg shadow-black/10 transition-[border-color,box-shadow,transform] duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
      style={{ willChange: "opacity, transform" }}
    >
      <Link href={`/shows/${encodeURIComponent(show.title)}`} className="absolute inset-0 z-0 rounded-2xl" />

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {show.title}
          </h3>
          <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary border-primary/20 text-[10px]">
            {show.recommendedAge}+
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {show.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 relative z-10">
          <Link
            href={`/shows/${encodeURIComponent(show.title)}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium transition-all duration-300 hover:shadow-md hover:shadow-primary/20 hover:scale-[1.02]"
          >
            Detalhes <ArrowRight className="h-3 w-3" />
          </Link>

          <button
            onClick={(e) => { e.preventDefault(); onHistory(show); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 text-xs text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
          >
            <History className="h-3 w-3" />
          </button>

          <div className="ml-auto flex gap-0.5">
            <button
              onClick={(e) => { e.preventDefault(); onEdit(show); }}
              className="p-1.5 rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete(show); }}
              className="p-1.5 rounded-full text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
});

export function ScrollCatalog({ shows, onEdit, onDelete, onHistory, onAdd }: ScrollCatalogProps) {
  const [search, setSearch] = useState("");

  const filteredShows = shows.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  if (shows.length === 0) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Nenhuma série cadastrada</h2>
          <p className="text-muted-foreground mb-6">Comece adicionando sua primeira série ao catálogo.</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]"
          >
            Adicionar Série
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="catalog" className="relative px-4 md:px-8 lg:px-12 pb-20">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center py-16"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-primary/70 mb-3">Catálogo</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="gradient-text">Séries</span>
        </h2>
        <div className="flex items-center justify-center gap-4 mt-6">
          <p className="text-muted-foreground">
            {shows.length} série{shows.length !== 1 ? "s" : ""} registrada{shows.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/30 text-sm text-primary transition-all duration-300 hover:bg-primary/5 hover:border-primary/50"
          >
            <Plus className="h-3.5 w-3.5" /> Nova Série
          </button>
        </div>
        <div className="relative mt-6 max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar série..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-card/60 border-border/50 focus-visible:ring-primary/40"
          />
        </div>
      </motion.div>

      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid: 4 columns, shows all cards */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
        {filteredShows.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-10">
            Nenhuma série encontrada para &ldquo;{search}&rdquo;.
          </p>
        )}
        {filteredShows.map((show, i) => (
          <ShowCard
            key={show["@key"]}
            show={show}
            index={i}
            onEdit={onEdit}
            onDelete={onDelete}
            onHistory={onHistory}
          />
        ))}
      </div>
    </section>
  );
}
