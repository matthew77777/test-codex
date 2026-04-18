'use client';

import { useEffect, useMemo, useState } from 'react';
import MixedBarLineChart from '@/components/charts/mixed-bar-line-chart';
import { useMetricsStore } from '@/stores/metrics-store';
import { useShallow } from 'zustand/react/shallow';

const cardTone: Record<string, string> = {
  warm: 'from-[#fff6ea] to-white',
  sky: 'from-[#ecf5ff] to-white',
  mint: 'from-[#e9fff3] to-white',
  purple: 'from-[#f4efff] to-white'
};

const LOOKBACK_OPTIONS = [
  { label: '1分', seconds: 60 },
  { label: '5分', seconds: 300 },
  { label: '15分', seconds: 900 }
];

export default function LiveDashboard() {
  const [lookbackSec, setLookbackSec] = useState(300);
  const [minutesAgo, setMinutesAgo] = useState(0);

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

      <section className="mt-4 rounded-2xl border border-brand-line bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0 text-sm font-medium text-brand-sub">表示期間:</p>
          {LOOKBACK_OPTIONS.map((option) => (
            <button
              key={option.seconds}
              type="button"
              onClick={() => setLookbackSec(option.seconds)}
              className={`rounded-full px-3 py-1 text-sm ${
                lookbackSec === option.seconds
                  ? 'bg-[#2248a8] text-white'
                  : 'border border-brand-line bg-white text-brand-sub hover:bg-[#f5f8ff]'
              }`}
            >
              {option.label}
            </button>
          ))}

          <label className="ml-auto flex items-center gap-2 text-sm text-brand-sub">
            何分前を表示
            <input
              type="range"
              min={0}
              max={60}
              value={minutesAgo}
              onChange={(e) => setMinutesAgo(Number(e.target.value))}
            />
            <span className="w-10 text-right">{minutesAgo}分</span>
          </label>
        </div>
      </section>

      <section className="mt-[18px] grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <article className={`rounded-2xl border border-brand-line bg-gradient-to-b ${cardTone.warm} p-3.5`}>
          <h2 className="m-0 text-base text-brand-sub">今日の使用量</h2>
          <p className="my-2 text-3xl font-bold">{data.cards.todayUsage.toFixed(1)} kWh</p>
          <small className="text-brand-sub">家族4人の平均より少し省エネです。</small>
        </article>
        <article className={`rounded-2xl border border-brand-line bg-gradient-to-b ${cardTone.sky} p-3.5`}>
          <h2 className="m-0 text-base text-brand-sub">太陽光の割合</h2>
          <p className="my-2 text-3xl font-bold">{data.cards.solarShare.toFixed(0)}%</p>
          <small className="text-brand-sub">昼間の電力の大半を自家発電でまかなっています。</small>
        </article>
        <article className={`rounded-2xl border border-brand-line bg-gradient-to-b ${cardTone.mint} p-3.5`}>
          <h2 className="m-0 text-base text-brand-sub">エコスコア</h2>
          <p className="my-2 text-3xl font-bold">{data.cards.ecoScore} 点</p>
          <small className="text-brand-sub">昨日より +3 点。とても良いペースです。</small>
        </article>
        <article className={`rounded-2xl border border-brand-line bg-gradient-to-b ${cardTone.purple} p-3.5`}>
          <h2 className="m-0 text-base text-brand-sub">節約できた金額</h2>
          <p className="my-2 text-3xl font-bold">¥{Math.round(data.cards.savedCost).toLocaleString()}</p>
          <small className="text-brand-sub">今月の累計。ゲーム感覚で続けましょう！</small>
        </article>
      </section>

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

        <article className="rounded-2xl border border-brand-line bg-white p-4">
          <h3 className="m-0 text-base font-semibold">いまの電力フロー</h3>
          <ul className="m-0 mt-2 list-none p-0">
            <li className="my-2 flex items-center justify-between rounded-xl border border-[#e8efff] bg-[#f8fbff] p-2.5 text-[#2d446d]">
              <span>🏠 家庭で使用中</span>
              <strong>{data.flow.home.toFixed(2)} kW</strong>
            </li>
            <li className="my-2 flex items-center justify-between rounded-xl border border-[#e8efff] bg-[#f8fbff] p-2.5 text-[#2d446d]">
              <span>🔋 蓄電池</span>
              <strong>{data.flow.battery.toFixed(2)} kW</strong>
            </li>
            <li className="my-2 flex items-center justify-between rounded-xl border border-[#e8efff] bg-[#f8fbff] p-2.5 text-[#2d446d]">
              <span>⚡ 電力会社から</span>
              <strong>{data.flow.grid.toFixed(2)} kW</strong>
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-brand-line bg-white p-4">
          <h3 className="m-0 text-base font-semibold">おすすめアクション</h3>
          <ol className="m-0 mt-2 pl-[1.1rem] text-[#2d446d]">
            {data.tips.map((tip) => (
              <li className="my-2" key={tip}>
                {tip}
              </li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}
