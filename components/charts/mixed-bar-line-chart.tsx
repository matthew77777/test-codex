import type { SeriesPoint } from '@/lib/types/metrics';

type Props = {
  title: string;
  unit: string;
  data: SeriesPoint[];
  threshold?: number;
  showThresholdWarning?: boolean;
};

const getLinePoints = (values: number[], width: number, height: number, max: number) => {
  if (!values.length) return '';

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(' ');
};

export default function MixedBarLineChart({
  title,
  unit,
  data,
  threshold,
  showThresholdWarning = false
}: Props) {
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.actual, item.forecast)),
    threshold ?? 0,
    1
  );

  const forecastLine = getLinePoints(
    data.map((point) => point.forecast),
    520,
    120,
    maxValue * 1.1
  );

  const detectedPeakCuts = data.filter((item) => item.peakCutDetected);
  const isOverThreshold = typeof threshold === 'number' && detectedPeakCuts.length > 0;

  return (
    <article className="rounded-2xl border border-brand-line bg-white p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="m-0 text-base font-semibold text-brand-navy">{title}</h3>
        <span className="text-sm text-brand-sub">{unit}</span>
      </div>

      {isOverThreshold && showThresholdWarning ? (
        <p className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          ⚠ ピークカット閾値を超えた履歴をグラフ上に保持しています。
        </p>
      ) : null}

      <div className="relative h-40 overflow-hidden rounded-xl border border-[#e5eeff] bg-[#f8fbff]">
        <div className="absolute inset-0 z-10 grid grid-cols-12 items-end gap-2 p-3">
          {data.map((point) => {
            const ratio = point.actual / (maxValue * 1.1);
            const overThreshold = !!point.peakCutDetected;

            return (
              <div key={`${point.time}-bar`} className="flex h-full items-end" title={`${point.time}: ${point.actual}${unit}`}>
                <span
                  className={`w-full rounded-t-md ${
                    overThreshold
                      ? 'bg-gradient-to-b from-[#ff9d9d] to-red-500'
                      : 'bg-gradient-to-b from-[#85a7ff] to-[#4f7fff]'
                  }`}
                  style={{ height: `${Math.max(ratio * 100, 3)}%` }}
                />
              </div>
            );
          })}
        </div>

        <svg viewBox="0 0 520 120" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 z-20 h-full w-full">
          <polyline points={forecastLine} className="fill-none stroke-[#15b877] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3]" />
          {typeof threshold === 'number' ? (
            <line
              x1="0"
              y1={120 - (threshold / (maxValue * 1.1)) * 120}
              x2="520"
              y2={120 - (threshold / (maxValue * 1.1)) * 120}
              className="stroke-[#fb923c] [stroke-dasharray:6_5] [stroke-width:2]"
            />
          ) : null}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1 text-xs text-brand-sub max-md:grid-cols-4 max-sm:grid-cols-3">
        {data.map((point) => (
          <span key={`${point.time}-label`}>{point.time}</span>
        ))}
      </div>

      {isOverThreshold && showThresholdWarning ? (
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-red-700">
          {detectedPeakCuts.map((item) => (
            <span key={`${item.time}-badge`} className="rounded-full border border-red-200 bg-red-50 px-2 py-1">
              発生: {item.time}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-brand-sub">
        <span>
          <i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#4f7fff]" /> 実績（棒）
        </span>
        <span>
          <i className="mr-1 inline-block w-4 border-t-2 border-[#15b877]" /> 予測（折れ線）
        </span>
        {typeof threshold === 'number' ? (
          <span>
            <i className="mr-1 inline-block w-4 border-t-2 border-dashed border-[#fb923c]" /> 閾値 {threshold.toFixed(1)}{' '}
            {unit}
          </span>
        ) : null}
      </div>
    </article>
  );
}
