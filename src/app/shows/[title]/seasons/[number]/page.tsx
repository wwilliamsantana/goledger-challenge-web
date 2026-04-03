import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiPost } from "@/lib/api";
import type { TvShow, Season, Episode } from "@/lib/types";
import { SeasonDetailClient } from "@/components/season-detail-client";

interface PageProps {
  params: Promise<{ title: string; number: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { title, number } = await params;
  const showTitle = decodeURIComponent(title);
  return {
    title: `${showTitle} — Temporada ${number} — StreamHub`,
    description: `Episódios da Temporada ${number} de ${showTitle} no StreamHub.`,
    openGraph: {
      title: `${showTitle} — Temporada ${number}`,
      description: `Episódios da Temporada ${number} de ${showTitle} registrados na blockchain GoLedger.`,
    },
  };
}

async function getSeasonData(showTitle: string, seasonNumber: number) {
  const showData = await apiPost("/query/search", {
    query: { selector: { "@assetType": "tvShows", title: showTitle } },
  });
  const show = showData.result?.[0] as TvShow | undefined;
  if (!show) return null;

  const seasonData = await apiPost("/query/search", {
    query: {
      selector: {
        "@assetType": "seasons",
        number: seasonNumber,
        tvShow: { "@assetType": "tvShows", "@key": show["@key"] },
      },
    },
  });
  const season = seasonData.result?.[0] as Season | undefined;
  if (!season) return null;

  const epData = await apiPost("/query/search", {
    query: {
      selector: {
        "@assetType": "episodes",
        season: { "@assetType": "seasons", "@key": season["@key"] },
      },
    },
  });
  const episodes = ((epData.result || []) as Episode[]).sort(
    (a, b) => a.episodeNumber - b.episodeNumber
  );

  return { show, season, episodes };
}

export default async function SeasonDetailPage({ params }: PageProps) {
  const { title, number } = await params;
  const showTitle = decodeURIComponent(title);
  const data = await getSeasonData(showTitle, Number(number));

  if (!data) notFound();

  return (
    <SeasonDetailClient
      show={data.show}
      season={data.season}
      initialEpisodes={data.episodes}
    />
  );
}
