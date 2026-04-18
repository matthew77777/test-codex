# EMS ダッシュボード（Next.js + Tailwind CSS）

一般ユーザー向けに、やさしい言葉で電力状況を確認できる EMS UI サンプルです。
Next.js (App Router) で構築し、ダミー API から定期取得したデータでグラフが更新されます。

## 主な機能

- 消費電力・太陽光発電の **実績（棒） + 予測（折れ線）** 表示
- 消費電力にピークカット閾値を設定し、到達時に色変更と警告表示
- `/api/metrics` でダミーデータを生成
- クライアント側で 5 秒ごとにデータ再取得

## 設計（保守性・安全性）

- `lib/types`: API レスポンス型を一元管理
- `lib/server`: API で使うダミーデータ生成ロジック
- `lib/constants`: 閾値やポーリング間隔などの定数
- `hooks`: データ取得ロジック（UI と分離）
- `components/charts`: グラフ描画コンポーネント
- API レスポンスに `Cache-Control: no-store`、`X-Content-Type-Options: nosniff` を付与
- スタイルは Tailwind CSS で統一管理

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
