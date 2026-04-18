import type { MetricsResponse } from '@/lib/types/metrics';

type Props = {
  flow: MetricsResponse['flow'];
  tips: string[];
};

export default function InfoPanels({ flow, tips }: Props) {
  return (
    <>
      <article className="rounded-2xl border border-brand-line bg-white p-4">
        <h3 className="m-0 text-base font-semibold">いまの電力フロー</h3>
        <ul className="m-0 mt-2 list-none p-0">
          <li className="my-2 flex items-center justify-between rounded-xl border border-[#e8efff] bg-[#f8fbff] p-2.5 text-[#2d446d]">
            <span>🏠 家庭で使用中</span>
            <strong>{flow.home.toFixed(2)} kW</strong>
          </li>
          <li className="my-2 flex items-center justify-between rounded-xl border border-[#e8efff] bg-[#f8fbff] p-2.5 text-[#2d446d]">
            <span>🔋 蓄電池</span>
            <strong>{flow.battery.toFixed(2)} kW</strong>
          </li>
          <li className="my-2 flex items-center justify-between rounded-xl border border-[#e8efff] bg-[#f8fbff] p-2.5 text-[#2d446d]">
            <span>⚡ 電力会社から</span>
            <strong>{flow.grid.toFixed(2)} kW</strong>
          </li>
        </ul>
      </article>

      <article className="rounded-2xl border border-brand-line bg-white p-4">
        <h3 className="m-0 text-base font-semibold">おすすめアクション</h3>
        <ol className="m-0 mt-2 pl-[1.1rem] text-[#2d446d]">
          {tips.map((tip) => (
            <li className="my-2" key={tip}>
              {tip}
            </li>
          ))}
        </ol>
      </article>
    </>
  );
}
