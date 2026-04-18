import type { MetricsResponse } from '@/lib/types/metrics';

const cardTone: Record<string, string> = {
  warm: 'from-[#fff6ea] to-white',
  sky: 'from-[#ecf5ff] to-white',
  mint: 'from-[#e9fff3] to-white',
  purple: 'from-[#f4efff] to-white'
};

type Props = {
  cards: MetricsResponse['cards'];
};

export default function KpiCards({ cards }: Props) {
  return (
    <section className="mt-[18px] grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
      <article className={`rounded-2xl border border-brand-line bg-gradient-to-b ${cardTone.warm} p-3.5`}>
        <h2 className="m-0 text-base text-brand-sub">今日の使用量</h2>
        <p className="my-2 text-3xl font-bold">{cards.todayUsage.toFixed(1)} kWh</p>
        <small className="text-brand-sub">家族4人の平均より少し省エネです。</small>
      </article>
      <article className={`rounded-2xl border border-brand-line bg-gradient-to-b ${cardTone.sky} p-3.5`}>
        <h2 className="m-0 text-base text-brand-sub">太陽光の割合</h2>
        <p className="my-2 text-3xl font-bold">{cards.solarShare.toFixed(0)}%</p>
        <small className="text-brand-sub">昼間の電力の大半を自家発電でまかなっています。</small>
      </article>
      <article className={`rounded-2xl border border-brand-line bg-gradient-to-b ${cardTone.mint} p-3.5`}>
        <h2 className="m-0 text-base text-brand-sub">エコスコア</h2>
        <p className="my-2 text-3xl font-bold">{cards.ecoScore} 点</p>
        <small className="text-brand-sub">昨日より +3 点。とても良いペースです。</small>
      </article>
      <article className={`rounded-2xl border border-brand-line bg-gradient-to-b ${cardTone.purple} p-3.5`}>
        <h2 className="m-0 text-base text-brand-sub">節約できた金額</h2>
        <p className="my-2 text-3xl font-bold">¥{Math.round(cards.savedCost).toLocaleString()}</p>
        <small className="text-brand-sub">今月の累計。ゲーム感覚で続けましょう！</small>
      </article>
    </section>
  );
}
