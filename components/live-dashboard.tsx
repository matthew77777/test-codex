'use client';

import { useEffect, useMemo, useState } from 'react';

type Metrics = {
  fetchedAt: string;
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
  demandSeries: { time: string; value: number }[];
  solarSeries: { time: string; value: number }[];
  tips: string[];
};

const toPath = (values: number[], height: number, width: number) => {
  if (!values.length) return '';
  const max = Math.max(...values) + 0.2;
  const min = Math.min(...values) - 0.2;
  const range = max - min || 1;

  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
};

export default function LiveDashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('データ取得に失敗しました。');
        }
        const json: Metrics = await res.json();
        if (mounted) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError instanceof Error ? fetchError.message : '不明なエラーが発生しました。');
          setLoading(false);
        }
      }
    };

    fetchMetrics();
    const timer = setInterval(fetchMetrics, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const demandLine = useMemo(
    () => toPath(data?.demandSeries.map((p) => p.value) ?? [], 120, 520),
    [data?.demandSeries]
  );
  const solarLine = useMemo(
    () => toPath(data?.solarSeries.map((p) => p.value) ?? [], 120, 520),
    [data?.solarSeries]
  );

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
          <p className="subtitle">太陽光・蓄電池・電力会社のバランスを、わかりやすく毎日チェックできます。</p>
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
        <article className="panel">
          <h3>消費電力の推移</h3>
          <svg viewBox="0 0 520 120" role="img" aria-label="消費電力の推移グラフ">
            <polyline points={demandLine} className="line demand" />
          </svg>
          <div className="labels">
            {data.demandSeries.map((point) => (
              <span key={point.time}>{point.time}</span>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>太陽光発電の推移</h3>
          <svg viewBox="0 0 520 120" role="img" aria-label="太陽光発電の推移グラフ">
            <polyline points={solarLine} className="line solar" />
          </svg>
          <div className="labels">
            {data.solarSeries.map((point) => (
              <span key={point.time}>{point.time}</span>
            ))}
          </div>
        </article>

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
