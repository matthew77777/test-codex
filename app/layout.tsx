import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EMS みまもりダッシュボード',
  description: '一般ユーザー向けの親しみやすい EMS ダッシュボード'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
