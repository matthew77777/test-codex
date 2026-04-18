'use client';

import { useEffect, useState } from 'react';
import { POLLING_INTERVAL_MS } from '@/lib/constants/thresholds';
import type { MetricsResponse } from '@/lib/types/metrics';

type Result = {
  data: MetricsResponse | null;
  loading: boolean;
  error: string | null;
};

export const useLiveMetrics = (): Result => {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let controller: AbortController | null = null;

    const fetchMetrics = async () => {
      controller?.abort();
      controller = new AbortController();

      try {
        const res = await fetch('/api/metrics', {
          cache: 'no-store',
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error('データ取得に失敗しました。');
        }

        const json: MetricsResponse = await res.json();

        if (!mounted) return;
        setData(json);
        setError(null);
      } catch (fetchError) {
        if (!mounted) return;
        setError(fetchError instanceof Error ? fetchError.message : '不明なエラーが発生しました。');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }

    };

    fetchMetrics();
    const timer = setInterval(fetchMetrics, POLLING_INTERVAL_MS);

    return () => {
      mounted = false;
      controller?.abort();
      clearInterval(timer);
    };
  }, []);

  return { data, loading, error };
};
