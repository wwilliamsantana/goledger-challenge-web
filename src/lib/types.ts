export interface TvShow {
  "@assetType": "tvShows";
  "@key": string;
  title: string;
  description: string;
  recommendedAge: number;
}

export interface Season {
  "@assetType": "seasons";
  "@key": string;
  number: number;
  year: number;
  tvShow: {
    "@assetType": "tvShows";
    "@key": string;
    title: string;
  };
}

export interface Episode {
  "@assetType": "episodes";
  "@key": string;
  episodeNumber: number;
  title: string;
  releaseDate: string;
  description: string;
  rating?: number;
  season: {
    "@assetType": "seasons";
    "@key": string;
    number: number;
    tvShow: {
      "@assetType": "tvShows";
      "@key": string;
      title: string;
    };
  };
}

export interface HistoryEntry {
  _txId: string;
  _timestamp: string;
  _isDelete: boolean;
  [key: string]: unknown;
}
