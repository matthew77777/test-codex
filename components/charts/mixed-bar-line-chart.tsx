'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SeriesPoint } from '@/lib/types/metrics';

type Props = {
  title: string;
  unit: string;
  data: SeriesPoint[];
  threshold?: number;
  showThresholdWarning?: boolean;
  controls?: ReactNode;
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

const sampleXAxis = (data: SeriesPoint[], count: number) => {
  if (!data.length) return [];
  if (data.length <= count) return data.map((point) => point.time);

  const step = Math.max(Math.floor((data.length - 1) / (count - 1)), 1);
  const labels: string[] = [];

  for (let i = 0; i < data.length; i += step) {
    labels.push(data[i].time);
  }

  if (labels[labels.length - 1] !== data[data.length - 1].time) {
    labels.push(data[data.length - 1].time);
  }

  return labels.slice(0, count);
};

export default function MixedBarLineChart({
  title,
  unit,
  data,
  threshold,
  showThresholdWarning = false,
  controls
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.actual, item.forecast)),
    threshold ?? 0,
    1
  );

  const chartScaleMax = maxValue * 1.1;
  const forecastLine = getLinePoints(
    data.map((point) => point.forecast),
    520,
    120,
    chartScaleMax
  );

  const detectedPeakCuts = data.filter((item) => item.peakCutDetected);
  const isOverThreshold = typeof threshold === 'number' && detectedPeakCuts.length > 0;
  const peakCutSummary = useMemo(() => {
    const bucket: Record<string, number> = {};
    detectedPeakCuts.forEach((item) => {
      const minuteKey = item.time.slice(0, 5);
      bucket[minuteKey] = (bucket[minuteKey] ?? 0) + 1;
    });
    return Object.entries(bucket)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-4);
  }, [detectedPeakCuts]);

  const yTicks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => Number(((chartScaleMax / steps) * i).toFixed(1))).reverse();
  }, [chartScaleMax]);

  const xLabels = useMemo(() => sampleXAxis(data, 6), [data]);

  const ChartBody = ({ large = false }: { large?: boolean }) => (
    <>
      <div className={`relative overflow-hidden rounded-xl border border-[#e5eeff] bg-[#f8fbff] ${large ? 'h-80' : 'h-48'}`}>
        <div className="pointer-events-none absolute inset-0 z-0 grid grid-rows-5">
          {yTicks.map((tick) => (
            <div key={`y-${tick}`} className="relative border-t border-dashed border-[#d5e2ff]/80">
              <span className="absolute -top-2 left-2 rounded bg-white/70 px-1 text-[10px] text-brand-sub">{tick}{unit}</span>
            </div>
          ))}
        </div>

        <div
          className="absolute inset-0 z-10 grid items-end gap-1 px-6 pb-3 pt-6"
          style={{ gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0, 1fr))` }}
        >
          {data.map((point) => {
            const ratio = point.actual / chartScaleMax;
            const overThreshold = !!point.peakCutDetected;

            return (
              <div key={`${point.timestamp}-bar`} className="flex h-full items-end" title={`${point.time}: ${point.actual}${unit}`}>
                <span
                  className={`w-full rounded-t-sm ${
                    overThreshold
                      ? 'bg-gradient-to-b from-[#ff9d9d] to-red-500'
                      : 'bg-gradient-to-b from-[#85a7ff] to-[#4f7fff]'
                  }`}
                  style={{ height: `${Math.max(ratio * 100, 2)}%` }}
                />
              </div>
            );
          })}
        </div>

        <svg viewBox="0 0 520 120" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 z-20 h-full w-full px-6 pb-3 pt-6">
          <polyline points={forecastLine} className="fill-none stroke-[#0ea56b] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3]" />
          {typeof threshold === 'number' ? (
            <line
              x1="0"
              y1={120 - (threshold / chartScaleMax) * 120}
              x2="520"
              y2={120 - (threshold / chartScaleMax) * 120}
              className="stroke-[#fb923c] [stroke-dasharray:6_5] [stroke-width:2]"
            />
          ) : null}
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-6 text-xs text-brand-sub">
        {xLabels.map((label, index) => (
          <span key={`${label}-${index}-axis`} className="text-center">
            {label}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <>
      <article className="rounded-2xl border border-brand-line bg-white p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="m-0 text-base font-semibold text-brand-navy">{title}</h3>
            <p className="m-0 text-xs text-brand-sub">実績は棒、予測は折れ線で表示</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {controls}
            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-lg border border-brand-line px-2 py-1 text-xs text-brand-sub hover:bg-[#f4f8ff]"
            >
              拡大
            </button>
            </div>
          </div>
        </div>

        {isOverThreshold && showThresholdWarning ? (
          <p className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            ⚠ ピークカット閾値を超えた履歴をグラフ上に保持しています。
          </p>
        ) : null}

        <ChartBody />

        {isOverThreshold && showThresholdWarning ? (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-red-700">
            {peakCutSummary.map(([minute, count]) => (
              <span key={`${minute}-badge`} className="rounded-full border border-red-200 bg-red-50 px-2 py-1">
                {minute}台: {count}件
              </span>
            ))}
            {detectedPeakCuts.length > peakCutSummary.length ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1">
                合計 {detectedPeakCuts.length} 件
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-brand-sub">
          <span>
            <i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#4f7fff]" /> 実績（棒）
          </span>
          <span>
            <i className="mr-1 inline-block w-4 border-t-2 border-[#0ea56b]" /> 予測（折れ線）
          </span>
          {typeof threshold === 'number' ? (
            <span>
              <i className="mr-1 inline-block w-4 border-t-2 border-dashed border-[#fb923c]" /> 閾値 {threshold.toFixed(1)} {unit}
            </span>
          ) : null}
        </div>
      </article>

      {expanded ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="m-0 text-lg font-semibold text-brand-navy">{title}（拡大表示）</h4>
                <p className="m-0 text-xs text-brand-sub">表示単位: 30分集計 / 電力単位: {unit}</p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-lg border border-brand-line px-3 py-1 text-sm text-brand-sub hover:bg-[#f4f8ff]"
              >
                閉じる
              </button>
            </div>
            <ChartBody large />
          </div>
        </div>
      ) : null}
    </>
  );
}
