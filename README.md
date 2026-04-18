# EMS ダッシュボード（Next.js）

一般ユーザー向けに、やさしい言葉と明るいデザインでエネルギー状況を確認できる EMS UI サンプルです。
Next.js (App Router) で構築し、ダミー API から定期取得したデータでグラフが自動更新されます。

## 主な機能

- 親しみやすいホーム向けダッシュボード UI
- `/api/metrics` でダミーデータを生成
- クライアント側で 5 秒ごとにデータ再取得
- SVG グラフをリアルタイム更新

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` にアクセスしてください。

## ビルド

```bash
npm run build
npm run start
```
