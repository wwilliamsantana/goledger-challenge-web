import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiQuery } from "@/lib/api";
import type { TvShow, Season } from "@/lib/types";
import { ShowDetailClient } from "@/components/show-detail-client";

interface PageProps {
  params: Promise<{ title: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { title } = await params;
  const showTitle = decodeURIComponent(title);
  return {
    title: `${showTitle} — LedgerCast`,
    description: `Temporadas e detalhes de ${showTitle} no LedgerCast.`,
    openGraph: {
      title: `${showTitle} — LedgerCast`,
      description: `Temporadas e detalhes de ${showTitle} registrados na blockchain GoLedger.`,
    },
  };
}

async function getShowData(showTitle: string) {
  const showData = await apiQuery("/query/search", {
    query: { selector: { "@assetType": "tvShows", title: showTitle } },
  });
  const show = showData.result?.[0] as TvShow | undefined;
  if (!show) return null;

  const seasonsData = await apiQuery("/query/search", {
    query: {
      selector: {
        "@assetType": "seasons",
        tvShow: { "@assetType": "tvShows", "@key": show["@key"] },
      },
    },
  });
  const seasons = ((seasonsData.result || []) as Season[]).sort(
    (a, b) => a.number - b.number
  );

  return { show, seasons };
}

export default async function ShowDetailPage({ params }: PageProps) {
  const { title } = await params;
  const showTitle = decodeURIComponent(title);
  const data = await getShowData(showTitle);

  if (!data) notFound();

  return <ShowDetailClient show={data.show} initialSeasons={data.seasons} />;
}
