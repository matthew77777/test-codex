import { NextResponse } from 'next/server';

type Point = {
  time: string;
  value: number;
};

const randomBetween = (min: number, max: number) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

const makeSeries = (base: number) => {
  const now = Date.now();
  const points: Point[] = [];

  for (let i = 11; i >= 0; i -= 1) {
    const time = new Date(now - i * 5 * 60 * 1000).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });

    points.push({
      time,
      value: Number((base + randomBetween(-0.6, 0.7)).toFixed(2))
    });
  }

  return points;
};

export async function GET() {
  const payload = {
    fetchedAt: new Date().toISOString(),
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
    demandSeries: makeSeries(3.2),
    solarSeries: makeSeries(2.6),
    tips: [
      '15:00〜17:00に洗濯を回すと、太陽光をより活用できます。',
      'エアコンの設定温度を1℃上げると、消費電力を約10%抑えられます。',
      '今夜は電気料金が安い時間帯です。蓄電池の充電におすすめです。'
    ]
  };

  return NextResponse.json(payload);
}
