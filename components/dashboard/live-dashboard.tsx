'use client';

import { useEffect, useMemo, useState } from 'react';
import MixedBarLineChart from '@/components/charts/mixed-bar-line-chart';
import ChartControls from '@/components/dashboard/chart-controls';
import InfoPanels from '@/components/dashboard/info-panels';
import KpiCards from '@/components/dashboard/kpi-cards';
import { useMetricsStore } from '@/stores/metrics-store';
import { useShallow } from 'zustand/react/shallow';

const LOOKBACK_OPTIONS = [
  { label: '5分', seconds: 300 },
  { label: '15分', seconds: 900 },
  { label: '30分', seconds: 1800 }
];

export default function LiveDashboard() {
  const [lookbackSec, setLookbackSec] = useState(300);
  const [minutesAgo, setMinutesAgo] = useState(5);

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

  const [demandWindow, solarWindow] = useMemo(() => {
    const endTs = Date.now() - minutesAgo * 60_000;
    const startTs = endTs - lookbackSec * 1000;

    const takeWindow = (series: typeof demandHistory) =>
      series.filter((point) => point.timestamp >= startTs && point.timestamp <= endTs).slice(-60);

    return [takeWindow(demandHistory), takeWindow(solarHistory)];
  }, [demandHistory, solarHistory, lookbackSec, minutesAgo]);

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
          <p className="m-0 max-w-[640px] leading-relaxed">実際の時刻の進行に合わせてグラフが更新され、過去ログもさかのぼって確認できます。</p>
        </div>
        <p className="m-0 whitespace-nowrap rounded-full border border-white/30 px-3 py-2 text-sm">
          最終更新: {new Date(data.fetchedAt).toLocaleTimeString('ja-JP')}
        </p>
      </header>

      <ChartControls
        options={LOOKBACK_OPTIONS}
        lookbackSec={lookbackSec}
        minutesAgo={minutesAgo}
        onLookbackChange={setLookbackSec}
        onMinutesAgoChange={setMinutesAgo}
      />

      <KpiCards cards={data.cards} />

      <section className="mt-3.5 grid grid-cols-[1.4fr_1.4fr_1fr] gap-3 max-lg:grid-cols-1">
        <MixedBarLineChart
          title="消費電力（実績・予測）"
          unit="kW"
          data={demandWindow.length ? demandWindow : data.demandSeries}
          threshold={data.threshold.peakCutKw}
          showThresholdWarning
        />

        <MixedBarLineChart
          title="太陽光発電（実績・予測）"
          unit="kW"
          data={solarWindow.length ? solarWindow : data.solarSeries}
        />

        <InfoPanels flow={data.flow} tips={data.tips} />
      </section>
    </main>
  );
}
