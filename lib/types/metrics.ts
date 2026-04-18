export type SeriesPoint = {
  time: string;
  actual: number;
  forecast: number;
  peakCutDetected?: boolean;
};

export type MetricsResponse = {
  fetchedAt: string;
  threshold: {
    peakCutKw: number;
  };
  cards: {
    todayUsage: number;
    solarShare: number;
    ecoScore: number;
    savedCost: number;
  };
  flow: {
    home: number;
    battery: number;
    grid: number;
  };
  demandSeries: SeriesPoint[];
  solarSeries: SeriesPoint[];
  tips: string[];
};
