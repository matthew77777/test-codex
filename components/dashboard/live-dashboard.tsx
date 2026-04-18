'use client';

import { useEffect, useMemo, useState } from 'react';
import MixedBarLineChart from '@/components/charts/mixed-bar-line-chart';
import ChartControls from '@/components/dashboard/chart-controls';
import InfoPanels from '@/components/dashboard/info-panels';
import KpiCards from '@/components/dashboard/kpi-cards';
import type { SeriesPoint } from '@/lib/types/metrics';
import { useMetricsStore } from '@/stores/metrics-store';
import { useShallow } from 'zustand/react/shallow';

const LOOKBACK_OPTIONS = [
  { label: '1日', seconds: 24 * 60 * 60 },
  { label: '3日', seconds: 3 * 24 * 60 * 60 },
  { label: '1週間', seconds: 7 * 24 * 60 * 60 },
  { label: '1か月', seconds: 30 * 24 * 60 * 60 },
  { label: '1年', seconds: 365 * 24 * 60 * 60 }
];

const THIRTY_MIN_MS = 30 * 60 * 1000;
const MAX_POINTS_ON_CHART = 120;

const aggregateByThirtyMin = (series: SeriesPoint[]) => {
  const bucket = new Map<number, SeriesPoint[]>();

  series.forEach((point) => {
    const key = Math.floor(point.timestamp / THIRTY_MIN_MS) * THIRTY_MIN_MS;
    const arr = bucket.get(key) ?? [];
    arr.push(point);
    bucket.set(key, arr);
  });

  return Array.from(bucket.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([timestamp, points]) => {
      const actual = points.reduce((sum, p) => sum + p.actual, 0) / points.length;
      const forecast = points.reduce((sum, p) => sum + p.forecast, 0) / points.length;

      return {
        timestamp,
        time: new Date(timestamp).toLocaleString('ja-JP', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        actual: Number(actual.toFixed(2)),
        forecast: Number(forecast.toFixed(2)),
        peakCutDetected: points.some((p) => p.peakCutDetected)
      };
    });
};

const downsample = (series: SeriesPoint[]) => {
  if (series.length <= MAX_POINTS_ON_CHART) return series;
  const step = Math.ceil(series.length / MAX_POINTS_ON_CHART);
  return series.filter((_, index) => index % step === 0);
};

export default function LiveDashboard() {
  const [demandLookbackSec, setDemandLookbackSec] = useState(24 * 60 * 60);
  const [solarLookbackSec, setSolarLookbackSec] = useState(24 * 60 * 60);

  const { data, loading, error, startRealtime, demandHistory, solarHistory } = useMetricsStore(
    useShallow((state) => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      startRealtime: state.startRealtime,
      demandHistory: state.demandHistory,
      solarHistory: state.solarHistory
    }))
  );

  useEffect(() => {
    const cleanup = startRealtime();
    return cleanup;
  }, [startRealtime]);

  const demandWindow = useMemo(() => {
    const endTs = Date.now();
    const startTs = endTs - demandLookbackSec * 1000;

    return downsample(
      aggregateByThirtyMin(demandHistory.filter((point) => point.timestamp >= startTs && point.timestamp <= endTs))
    );
  }, [demandHistory, demandLookbackSec]);

  const solarWindow = useMemo(() => {
    const endTs = Date.now();
    const startTs = endTs - solarLookbackSec * 1000;

    return downsample(
      aggregateByThirtyMin(solarHistory.filter((point) => point.timestamp >= startTs && point.timestamp <= endTs))
    );
  }, [solarHistory, solarLookbackSec]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center text-lg text-brand-sub">読み込み中です…</main>;
  }

  if (error || !data) {
    return <main className="grid min-h-screen place-items-center text-lg text-brand-sub">{error ?? '表示できるデータがありません。'}</main>;
  }

  return (
    <main className="mx-auto max-w-[1120px] px-5 pb-10 pt-7">
      <header className="flex items-start justify-between gap-4 rounded-[20px] bg-gradient-to-br from-[#2248a8] via-[#3f72ff] to-[#57a4ff] p-6 text-[#f2f7ff] shadow-hero max-sm:flex-col">
        <div>
          <p className="m-0 text-sm opacity-85">ようこそ！</p>
          <h1 className="my-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold">おうちのエネルギー見える化</h1>
          <p className="m-0 max-w-[640px] leading-relaxed">グラフは30分単位で集計し、各グラフごとに表示期間を選択できます。</p>
        </div>
        <p className="m-0 whitespace-nowrap rounded-full border border-white/30 px-3 py-2 text-sm">
          最終更新: {new Date(data.fetchedAt).toLocaleTimeString('ja-JP')}
        </p>
      </header>

      <KpiCards cards={data.cards} />

      <section className="mt-3.5 grid grid-cols-[1.4fr_1.4fr_1fr] gap-3 max-lg:grid-cols-1">
        <MixedBarLineChart
          title="消費電力（実績・予測）"
          unit="kW"
          data={demandWindow.length ? demandWindow : data.demandSeries}
          threshold={data.threshold.peakCutKw}
          showThresholdWarning
          controls={
            <ChartControls
              options={LOOKBACK_OPTIONS}
              value={demandLookbackSec}
              onChange={setDemandLookbackSec}
            />
          }
        />

        <MixedBarLineChart
          title="太陽光発電（実績・予測）"
          unit="kW"
          data={solarWindow.length ? solarWindow : data.solarSeries}
          controls={
            <ChartControls
              options={LOOKBACK_OPTIONS}
              value={solarLookbackSec}
              onChange={setSolarLookbackSec}
            />
          }
        />

        <InfoPanels flow={data.flow} tips={data.tips} />
      </section>
    </main>
  );
}
