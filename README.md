# Firebase Anonymous Auth 対応版 - 4ファイル

このアーカイブには、既存のテニスチーム管理アプリにFirebase Anonymous Authを追加するための4つのファイルが含まれています。

## 📦 含まれるファイル

1. **src/lib/firebase.ts** - Firebase初期化（Auth追加）
2. **src/lib/auth.ts** - 認証ロジック（Anonymous Auth統合）
3. **src/types/index.ts** - 型定義（uid追加）
4. **firestore.rules** - Firestoreセキュリティルール（認証ベース）

## 🔧 インストール手順

### 1. ファイルを既存プロジェクトに上書き

```bash
# アーカイブを解凍
tar -xzf firebase-auth-upgrade.tar.gz

# プロジェクトのルートディレクトリで実行
cp firebase-auth-files/src/lib/firebase.ts src/lib/
cp firebase-auth-files/src/lib/auth.ts src/lib/
cp firebase-auth-files/src/types/index.ts src/types/
cp firebase-auth-files/firestore.rules .
```

### 2. Firestoreルールをデプロイ

**オプションA: Firebase Console から手動で設定**
1. https://console.firebase.google.com/ にアクセス
2. プロジェクトを選択
3. Firestore Database → ルール
4. `firestore.rules` の内容をコピー＆ペースト
5. 「公開」をクリック

**オプションB: Firebase CLI でデプロイ**
```bash
firebase deploy --only firestore:rules
```

### 3. Firebase Authenticationを有効化

1. Firebase Console → Authentication
2. 「始める」をクリック
3. 「Sign-in method」タブ
4. 「匿名」を有効化

### 4. 動作確認

```bash
npm run dev
```

- チーム作成 → 自動的にAnonymous Authでログイン
- チーム参加 → 自動的にAnonymous Authでログイン
- ログイン → 既存メンバーにuidが追加される

## 📝 変更内容の詳細

### firebase.ts の変更
```typescript
// 追加
import { getAuth } from 'firebase/auth';
export const auth = getAuth(app);
```

### auth.ts の変更
```typescript
// 各関数に追加
const userCredential = await signInAnonymously(auth);
const uid = userCredential.user.uid;

// メンバー作成時
await addDoc(collection(db, 'members'), {
  uid: uid,  // ← 追加
  teamId,
  nachname,
  // ...
});
```

### types/index.ts の変更
```typescript
export interface Member {
  id: string;
  uid?: string;  // ← 追加（オプショナル）
  teamId: string;
  // ...
}
```

### firestore.rules の変更
```javascript
// request.auth.uid を使った認証チェック
function isMemberWithUid(memberId) {
  return get(/databases/$(database)/documents/members/$(memberId)).data.uid == request.auth.uid;
}
```

## 🔒 セキュリティの改善

**変更前:**
- 認証なし
- 誰でも全データにアクセス可能

**変更後:**
- Firebase Anonymous Authによる認証
- 自分のチームのデータのみアクセス可能
- 自分の回答のみ編集可能
- 管理者のみが試合やメンバーを管理可能

## ⚡ 既存データとの互換性

- `uid`フィールドはオプショナル（`uid?`）
- 既存のメンバーデータは引き続き動作
- 既存メンバーがログインすると自動的に`uid`が追加される

## 🚀 段階的移行

既存のアプリが稼働中の場合：

1. まず開発環境でテスト
2. 本番環境にデプロイ
3. 既存ユーザーが次回ログイン時に自動的に`uid`が追加される
4. 全ユーザーに`uid`が設定されたら完了

## ⚠️ 注意事項

### Anonymous Authの制限
- ブラウザのデータをクリアすると認証情報が失われる
- 異なるデバイスでは別のユーザーとして扱われる
- ローカルストレージのセッション情報は引き続き使用される

### 推奨される使い方
- 内輪のチーム（信頼できるメンバーのみ）
- メンバーには「ブラウザのデータを消さないように」と案内
- 必要に応じて、将来的にメールログインに移行可能

## 🔄 将来のアップグレード

この実装は将来的にメールログインに移行しやすい設計です：

```typescript
// Anonymous Auth → Email/Passwordへの移行も容易
const userCredential = await signInWithEmailAndPassword(auth, email, password);
// uid の扱いは同じ
```

## 📞 トラブルシューティング

### エラー: "Firebase: Error (auth/operation-not-allowed)"
→ Firebase Console で Anonymous Auth を有効化してください

### エラー: "Missing or insufficient permissions"
→ Firestoreルールが正しくデプロイされているか確認してください

### 既存データが見えない
→ ログインして`uid`が追加されるまで待つか、手動でFirestoreで`uid`を追加してください

---

**これで完了です！** 🎉

既存のアプリに4ファイルを上書きするだけで、Firebase Anonymous Authによる認証が追加されます。
