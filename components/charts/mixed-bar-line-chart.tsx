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

  const isOverThreshold =
    typeof threshold === 'number' && data.some((item) => item.actual >= threshold);

  return (
    <article className="panel chart-panel">
      <div className="panel-head">
        <h3>{title}</h3>
        <span>{unit}</span>
      </div>
      {isOverThreshold && showThresholdWarning ? (
        <p className="alert-banner">⚠ ピークカット閾値を超える需要が検知されました。</p>
      ) : null}

      <div className="mixed-chart" role="img" aria-label={`${title} グラフ`}>
        <div className="bars">
          {data.map((point) => {
            const ratio = point.actual / (maxValue * 1.1);
            const overThreshold = typeof threshold === 'number' && point.actual >= threshold;

            return (
              <div key={`${point.time}-bar`} className="bar-wrap" title={`${point.time}: ${point.actual}${unit}`}>
                <span
                  className={`bar ${overThreshold ? 'bar-alert' : ''}`}
                  style={{ height: `${Math.max(ratio * 100, 3)}%` }}
                />
              </div>
            );
          })}
        </div>

        <svg viewBox="0 0 520 120" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={forecastLine} className="line forecast" />
          {typeof threshold === 'number' ? (
            <line
              x1="0"
              y1={120 - (threshold / (maxValue * 1.1)) * 120}
              x2="520"
              y2={120 - (threshold / (maxValue * 1.1)) * 120}
              className="threshold-line"
            />
          ) : null}
        </svg>
      </div>

      <div className="labels">
        {data.map((point) => (
          <span key={`${point.time}-label`}>{point.time}</span>
        ))}
      </div>

      <div className="legend">
        <span>
          <i className="legend-box" /> 実績（棒）
        </span>
        <span>
          <i className="legend-line" /> 予測（折れ線）
        </span>
        {typeof threshold === 'number' ? (
          <span>
            <i className="legend-threshold" /> 閾値 {threshold.toFixed(1)} {unit}
          </span>
        ) : null}
      </div>
    </article>
  );
}
