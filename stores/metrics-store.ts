'use client';

import { create } from 'zustand';
import { POLLING_INTERVAL_MS } from '@/lib/constants/thresholds';
import type { MetricsResponse, SeriesPoint } from '@/lib/types/metrics';

type MetricsState = {
  data: MetricsResponse | null;
  demandHistory: SeriesPoint[];
  solarHistory: SeriesPoint[];
  loading: boolean;
  error: string | null;
  started: boolean;
  peakCutHistory: Record<number, true>;
  fetchMetrics: () => Promise<void>;
  applyRealtimeTick: () => void;
  startRealtime: () => () => void;
};

const HISTORY_LIMIT = 20_000;
const LIVE_POINT_INTERVAL_MS = 5_000;
const HALF_HOUR_MS = 30 * 60 * 1000;

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const pushWithLimit = (history: SeriesPoint[], point: SeriesPoint) => {
  const next = [...history, point];
  if (next.length <= HISTORY_LIMIT) return next;
  return next.slice(next.length - HISTORY_LIMIT);
};

const buildSyntheticHistory = (latestPoints: SeriesPoint[], threshold: number): SeriesPoint[] => {
  if (!latestPoints.length) return [];

  const latest = latestPoints[latestPoints.length - 1];
  const pointsPerYear = 365 * 48;
  const history: SeriesPoint[] = [];

  let actual = latest.actual;
  let forecast = latest.forecast;

  for (let i = pointsPerYear; i >= 1; i -= 1) {
    const timestamp = latest.timestamp - i * HALF_HOUR_MS;
    const dailyWave = Math.sin((i / 48) * Math.PI * 2) * 0.25;
    const noise = (Math.random() - 0.5) * 0.12;

    actual = clamp(Number((actual * 0.93 + latest.actual * 0.07 + dailyWave + noise).toFixed(2)), 0.8, 8);
    forecast = clamp(Number((forecast * 0.94 + latest.forecast * 0.06 + dailyWave * 0.8).toFixed(2)), 0.8, 8);

    history.push({
      timestamp,
      time: formatTime(timestamp),
      actual,
      forecast,
      peakCutDetected: actual >= threshold
    });
  }

  return [...history, ...latestPoints];
};

let fetchIntervalId: ReturnType<typeof setInterval> | null = null;
let tickIntervalId: ReturnType<typeof setInterval> | null = null;

export const useMetricsStore = create<MetricsState>((set, get) => ({
  data: null,
  demandHistory: [],
  solarHistory: [],
  loading: true,
  error: null,
  started: false,
  peakCutHistory: {},

  fetchMetrics: async () => {
    try {
      const res = await fetch('/api/metrics', { cache: 'no-store' });
      if (!res.ok) throw new Error('データ取得に失敗しました。');

      const json: MetricsResponse = await res.json();
      const threshold = json.threshold.peakCutKw;
      const peakCutHistory = { ...get().peakCutHistory };

      const normalizedDemand = json.demandSeries.map((point) => {
        if (point.actual >= threshold) peakCutHistory[point.timestamp] = true;
        return {
          ...point,
          peakCutDetected: point.actual >= threshold || !!peakCutHistory[point.timestamp]
        };
      });

      const demandHistoryBase = get().demandHistory;
      const solarHistoryBase = get().solarHistory;

      const demandHistorySeed =
        demandHistoryBase.length === 0
          ? buildSyntheticHistory(normalizedDemand, threshold)
          : normalizedDemand.reduce((acc, point) => pushWithLimit(acc, point), demandHistoryBase);

      const solarHistorySeed =
        solarHistoryBase.length === 0
          ? buildSyntheticHistory(json.solarSeries, threshold)
          : json.solarSeries.reduce((acc, point) => pushWithLimit(acc, point), solarHistoryBase);

      set({
        data: { ...json, demandSeries: normalizedDemand, fetchedAt: new Date().toISOString() },
        demandHistory: demandHistorySeed,
        solarHistory: solarHistorySeed,
        peakCutHistory,
        loading: false,
        error: null
      });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : '不明なエラーが発生しました。' });
    }
  },

  applyRealtimeTick: () => {
    const current = get().data;
    if (!current) return;

    const now = Date.now();
    const threshold = current.threshold.peakCutKw;
    const peakCutHistory = { ...get().peakCutHistory };

    const mutateLast = (series: SeriesPoint[], isDemand: boolean): SeriesPoint[] => {
      if (!series.length) return series;
      const next = [...series];
      const last = { ...next[next.length - 1] };

      const actualNoise = (Math.random() - 0.5) * 0.16;
      const forecastNoise = (Math.random() - 0.5) * 0.06;
      const meanReversion = (last.forecast - last.actual) * 0.25;

      last.actual = clamp(Number((last.actual + meanReversion + actualNoise).toFixed(2)), 0.8, 8);
      last.forecast = clamp(Number((last.forecast + forecastNoise).toFixed(2)), 0.8, 8);
      last.time = formatTime(now);
      last.timestamp = now;

      if (isDemand && (last.actual >= threshold || peakCutHistory[last.timestamp])) {
        peakCutHistory[last.timestamp] = true;
        last.peakCutDetected = true;
      }

      next[next.length - 1] = last;
      return next;
    };

    const demandSeries = mutateLast(current.demandSeries, true);
    const solarSeries = mutateLast(current.solarSeries, false);

    let demandHistory = get().demandHistory;
    let solarHistory = get().solarHistory;

    if (now % LIVE_POINT_INTERVAL_MS < 1000) {
      const demandPoint = {
        ...demandSeries[demandSeries.length - 1],
        timestamp: now,
        time: formatTime(now)
      };
      const solarPoint = {
        ...solarSeries[solarSeries.length - 1],
        timestamp: now,
        time: formatTime(now)
      };

      demandHistory = pushWithLimit(demandHistory, demandPoint);
      solarHistory = pushWithLimit(solarHistory, solarPoint);

      const trim = (series: SeriesPoint[], point: SeriesPoint) => [...series.slice(1), point];

      set({
        data: {
          ...current,
          fetchedAt: new Date().toISOString(),
          demandSeries: trim(demandSeries, demandPoint),
          solarSeries: trim(solarSeries, solarPoint)
        },
        demandHistory,
        solarHistory,
        peakCutHistory
      });
      return;
    }

    set({
      data: {
        ...current,
        fetchedAt: new Date().toISOString(),
        demandSeries,
        solarSeries
      },
      peakCutHistory
    });
  },

  startRealtime: () => {
    if (get().started) return () => undefined;

    set({ started: true });
    void get().fetchMetrics();

    fetchIntervalId = setInterval(() => {
      void get().fetchMetrics();
    }, POLLING_INTERVAL_MS);

    tickIntervalId = setInterval(() => {
      get().applyRealtimeTick();
    }, 1000);

    return () => {
      if (fetchIntervalId) clearInterval(fetchIntervalId);
      if (tickIntervalId) clearInterval(tickIntervalId);
      fetchIntervalId = null;
      tickIntervalId = null;
      set({ started: false });
    };
  }
}));
