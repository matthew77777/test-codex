# EMS ダッシュボード（Next.js + Tailwind CSS）

一般ユーザー向けに、やさしい言葉で電力状況を確認できる EMS UI サンプルです。
Next.js (App Router) で構築し、ダミー API とリアルタイム更新でグラフを表示します。

## 主な機能

- 消費電力・太陽光発電の **実績（棒） + 予測（折れ線）** 表示
- 実際の時刻進行に合わせて 1 秒ごとにグラフ更新
- 5 秒ごとに新しい観測点を追加し、履歴を保持
- グラフは30分単位で集計
- 表示期間を **1日 / 3日 / 1週間 / 1か月 / 1年** で選択可能（各グラフ右上）
- 見やすさ向上のため、グラフに補助目盛り・Y軸ガイド・間引きラベルを追加
- グラフをモーダルで拡大表示
- 消費電力にピークカット閾値を設定し、到達時に色変更と警告表示
- ピークカット履歴は時刻ごとの大量表示を避け、時間帯ごとの集約表示で見やすく整理
- Zustand ストアで状態管理（取得・履歴管理・リアルタイム更新）

## 設計（保守性・安全性）

- `lib/types`: API レスポンス型を一元管理
- `lib/server`: API で使うダミーデータ生成ロジック
- `lib/constants`: 閾値やポーリング間隔などの定数
- `stores`: Zustand によるクライアント状態管理
- `components/dashboard`: ダッシュボードUIを機能単位で分割
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
