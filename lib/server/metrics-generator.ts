import { PEAK_CUT_THRESHOLD_KW, SERIES_POINTS } from '@/lib/constants/thresholds';
import type { MetricsResponse, SeriesPoint } from '@/lib/types/metrics';

const randomBetween = (min: number, max: number): number => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

const buildSeries = ({
  actualBase,
  forecastBase,
  actualVariance,
  forecastVariance
}: {
  actualBase: number;
  forecastBase: number;
  actualVariance: number;
  forecastVariance: number;
}): SeriesPoint[] => {
  const now = Date.now();

  return Array.from({ length: SERIES_POINTS }, (_, i) => {
    const reverseIndex = SERIES_POINTS - 1 - i;
    const time = new Date(now - reverseIndex * 5 * 60 * 1000).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      time,
      actual: Number((actualBase + randomBetween(-actualVariance, actualVariance)).toFixed(2)),
      forecast: Number((forecastBase + randomBetween(-forecastVariance, forecastVariance)).toFixed(2))
    };
  });
};

export const generateMetrics = (): MetricsResponse => {
  const demandSeries = buildSeries({
    actualBase: 3.1,
    forecastBase: 3,
    actualVariance: 0.8,
    forecastVariance: 0.4
  });

  const solarSeries = buildSeries({
    actualBase: 2.3,
    forecastBase: 2.5,
    actualVariance: 0.7,
    forecastVariance: 0.35
  });

  return {
    fetchedAt: new Date().toISOString(),
    threshold: {
      peakCutKw: PEAK_CUT_THRESHOLD_KW
    },
    cards: {
      todayUsage: randomBetween(21, 27),
      solarShare: randomBetween(48, 64),
      ecoScore: Math.round(randomBetween(75, 95)),
      savedCost: randomBetween(3200, 4600)
    },
    flow: {
      home: randomBetween(2.4, 3.7),
      battery: randomBetween(-1.3, 1.8),
      grid: randomBetween(0.2, 2.2)
    },
    demandSeries,
    solarSeries,
    tips: [
      '15:00〜17:00に洗濯を回すと、太陽光をより活用できます。',
      'エアコンの設定温度を1℃上げると、消費電力を約10%抑えられます。',
      '今夜は電気料金が安い時間帯です。蓄電池の充電におすすめです。'
    ]
  };
};
