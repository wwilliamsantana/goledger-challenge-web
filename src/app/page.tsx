
import type { Metadata } from "next";
import { apiQuery } from "@/lib/api";
import type { TvShow } from "@/lib/types";
import { HomeClient } from "@/components/home-client";

export const metadata: Metadata = {
  title: "LedgerCast — Catálogo de Séries na Blockchain",
  description:
    "Gerencie séries, temporadas e episódios com imutabilidade e rastreabilidade total na blockchain GoLedger.",
  openGraph: {
    title: "LedgerCast — Catálogo de Séries",
    description:
      "Plataforma de gerenciamento de séries de TV com registro imutável em blockchain GoLedger.",
    type: "website",
  },
};

async function getShows(): Promise<TvShow[]> {
  try {
    const data = await apiQuery("/query/search", {
      query: { selector: { "@assetType": "tvShows" } },
    });
    return data.result || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const shows = await getShows();
  return <HomeClient initialShows={shows} />;
}
