'use client';

import { create } from 'zustand';
import { POLLING_INTERVAL_MS } from '@/lib/constants/thresholds';
import type { MetricsResponse, SeriesPoint } from '@/lib/types/metrics';

type MetricsState = {
  data: MetricsResponse | null;
  loading: boolean;
  error: string | null;
  started: boolean;
  peakCutHistory: Record<string, true>;
  fetchMetrics: () => Promise<void>;
  applyRealtimeTick: () => void;
  startRealtime: () => () => void;
};

const nowLabel = () =>
  new Date().toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const updateSeries = (series: SeriesPoint[], threshold?: number): SeriesPoint[] => {
  if (!series.length) return series;

  const next = [...series];
  const last = next[next.length - 1];

  const moved = Number((last.actual + (Math.random() - 0.5) * 0.2).toFixed(2));
  const movedForecast = Number((last.forecast + (Math.random() - 0.5) * 0.1).toFixed(2));

  next[next.length - 1] = {
    ...last,
    actual: clamp(moved, 0, 8),
    forecast: clamp(movedForecast, 0, 8)
  };

  const sec = new Date().getSeconds();
  if (sec % 5 === 0) {
    const newPoint: SeriesPoint = {
      time: nowLabel(),
      actual: next[next.length - 1].actual,
      forecast: next[next.length - 1].forecast,
      peakCutDetected: false
    };
    next.shift();
    next.push(newPoint);
  }

  if (typeof threshold === 'number') {
    return next.map((point) => ({
      ...point,
      peakCutDetected: point.peakCutDetected || point.actual >= threshold
    }));
  }

  return next;
};

let fetchIntervalId: ReturnType<typeof setInterval> | null = null;
let tickIntervalId: ReturnType<typeof setInterval> | null = null;

export const useMetricsStore = create<MetricsState>((set, get) => ({
  data: null,
  loading: true,
  error: null,
  started: false,
  peakCutHistory: {},

  fetchMetrics: async () => {
    try {
      const res = await fetch('/api/metrics', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('データ取得に失敗しました。');
      }

      const json: MetricsResponse = await res.json();
      const threshold = json.threshold.peakCutKw;
      const history = { ...get().peakCutHistory };

      json.demandSeries = json.demandSeries.map((point) => {
        if (point.actual >= threshold) {
          history[point.time] = true;
        }

        return {
          ...point,
          peakCutDetected: point.actual >= threshold || !!history[point.time]
        };
      });

      set({
        data: { ...json, fetchedAt: new Date().toISOString() },
        loading: false,
        error: null,
        peakCutHistory: history
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : '不明なエラーが発生しました。'
      });
    }
  },

  applyRealtimeTick: () => {
    const current = get().data;
    if (!current) return;

    const nextDemand = updateSeries(current.demandSeries, current.threshold.peakCutKw);
    const nextSolar = updateSeries(current.solarSeries);

    const history = { ...get().peakCutHistory };
    nextDemand.forEach((point) => {
      if (point.peakCutDetected) {
        history[point.time] = true;
      }
    });

    const normalizedDemand = nextDemand.map((point) => ({
      ...point,
      peakCutDetected: point.peakCutDetected || !!history[point.time]
    }));

    set({
      data: {
        ...current,
        fetchedAt: new Date().toISOString(),
        demandSeries: normalizedDemand,
        solarSeries: nextSolar
      },
      peakCutHistory: history
    });
  },

  startRealtime: () => {
    if (get().started) {
      return () => undefined;
    }

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
