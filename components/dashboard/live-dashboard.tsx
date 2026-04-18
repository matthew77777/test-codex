'use client';

import MixedBarLineChart from '@/components/charts/mixed-bar-line-chart';
import { useLiveMetrics } from '@/hooks/use-live-metrics';

export default function LiveDashboard() {
  const { data, loading, error } = useLiveMetrics();

  if (loading) {
    return <main className="center-message">読み込み中です…</main>;
  }

  if (error || !data) {
    return <main className="center-message">{error ?? '表示できるデータがありません。'}</main>;
  }

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="kicker">ようこそ！</p>
          <h1>おうちのエネルギー見える化</h1>
          <p className="subtitle">消費電力と太陽光発電の実績・予測を同時に確認できます。</p>
        </div>
        <p className="updated">最終更新: {new Date(data.fetchedAt).toLocaleTimeString('ja-JP')}</p>
      </header>

      <section className="cards">
        <article className="card warm">
          <h2>今日の使用量</h2>
          <p className="value">{data.cards.todayUsage.toFixed(1)} kWh</p>
          <small>家族4人の平均より少し省エネです。</small>
        </article>
        <article className="card sky">
          <h2>太陽光の割合</h2>
          <p className="value">{data.cards.solarShare.toFixed(0)}%</p>
          <small>昼間の電力の大半を自家発電でまかなっています。</small>
        </article>
        <article className="card mint">
          <h2>エコスコア</h2>
          <p className="value">{data.cards.ecoScore} 点</p>
          <small>昨日より +3 点。とても良いペースです。</small>
        </article>
        <article className="card purple">
          <h2>節約できた金額</h2>
          <p className="value">¥{Math.round(data.cards.savedCost).toLocaleString()}</p>
          <small>今月の累計。ゲーム感覚で続けましょう！</small>
        </article>
      </section>

      <section className="grid">
        <MixedBarLineChart
          title="消費電力（実績・予測）"
          unit="kW"
          data={data.demandSeries}
          threshold={data.threshold.peakCutKw}
          showThresholdWarning
        />

        <MixedBarLineChart title="太陽光発電（実績・予測）" unit="kW" data={data.solarSeries} />

        <article className="panel flow">
          <h3>いまの電力フロー</h3>
          <ul>
            <li>
              <span>🏠 家庭で使用中</span>
              <strong>{data.flow.home.toFixed(2)} kW</strong>
            </li>
            <li>
              <span>🔋 蓄電池</span>
              <strong>{data.flow.battery.toFixed(2)} kW</strong>
            </li>
            <li>
              <span>⚡ 電力会社から</span>
              <strong>{data.flow.grid.toFixed(2)} kW</strong>
            </li>
          </ul>
        </article>

        <article className="panel tips">
          <h3>おすすめアクション</h3>
          <ol>
            {data.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  );
}
