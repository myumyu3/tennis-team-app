# Tennis Team Manager V2 (改善版)

## 改善点

### 1. 日付入力の改善
- テキスト入力から`<input type="date">`に変更
- ドイツ語ロケール対応
- スムーズな入力体験

### 2. 時刻をオプショナルに
- 時刻（Uhrzeit）が任意入力に
- 空の場合は「Zeit noch offen」と表示
- データモデルで`uhrzeit?`に変更

### 3. Gastspiel車管理UI大幅改善
- ダイアログ廃止
- チェックボックス方式でドライバー選択
- 各ドライバーに座席数入力（0〜7）
- スマホでタップしやすい大きなUI
- 一括保存機能

## セットアップ

```bash
npm install
# .env.local を設定
npm run dev
```

詳細は元のREADMEを参照してください。
