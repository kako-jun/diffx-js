# diffx-js

Node.js/npm向けのdiffxバインディング。Rustのdiffx-coreをnapi-rsでラップ。

## アーキテクチャ

```
diffx-core (crates.io 0.6.1)  ←  Rustネイティブライブラリ
      ↓
diffx-js (this)               ←  napi-rsでNode.jsバインディング
      ↓
npm package                   ←  プラットフォーム別.nodeファイルを配布
```

## 構造

```
diffx-js/
├── src/lib.rs          # napi-rsバインディング実装
├── build.rs            # napi-rsビルドスクリプト
├── Cargo.toml          # diffx-core依存（crates.io版）
├── package.json        # npm設定 + jest設定
├── index.js            # 自動生成（プラットフォーム検出）
├── index.d.ts          # 自動生成（TypeScript型定義）
├── tests/              # Jestテスト（51テスト）
│   ├── diff.test.js
│   ├── parsers.test.js
│   └── format.test.js
├── .husky/pre-commit   # cargo fmt実行
└── .github/workflows/
    ├── ci.yml          # push/PR → fmt + clippy + build + test
    └── release.yml     # タグ → 6プラットフォームビルド + Release作成
```

## ビルド

```bash
npm install           # 依存インストール
npm run build         # napi build --platform --release
npm test              # jest実行（51テスト）
cargo fmt --check     # フォーマットチェック
cargo clippy          # lint
```

## GitHub Actions

| ワークフロー | トリガー | 動作 |
|-------------|---------|------|
| ci.yml | push/PR to main | fmt + clippy + Linux x64ビルド + テスト |
| release.yml | タグ v* | 6プラットフォームビルド + GitHub Release作成 |

### ビルドターゲット（release.yml）

- x86_64-unknown-linux-gnu
- x86_64-unknown-linux-musl
- aarch64-unknown-linux-gnu
- x86_64-apple-darwin
- aarch64-apple-darwin
- x86_64-pc-windows-msvc

## リリース手順

1. `package.json`と`Cargo.toml`のバージョンを更新
2. コミット & プッシュ
3. `git tag v0.6.1 && git push origin v0.6.1`
4. GitHub Actionsがビルド → Release作成 → バイナリ添付
5. Releaseからバイナリをダウンロード
6. `npm publish --access public`（手動）

## API

### diff(old, new, options?)
2つのオブジェクトを比較し、差分を返す。

オプション:
- `epsilon` - 数値比較の許容誤差
- `arrayIdKey` - 配列要素の識別キー
- `ignoreKeysRegex` - 無視するキーの正規表現
- `pathFilter` - パスフィルタ
- `outputFormat` - 出力フォーマット
- `ignoreWhitespace` - 空白を無視
- `ignoreCase` - 大文字小文字を無視
- `briefMode` - 簡略モード
- `quietMode` - 静粛モード

### パーサー
- `parseJson(content)` - JSON
- `parseYaml(content)` - YAML
- `parseToml(content)` - TOML
- `parseCsv(content)` - CSV
- `parseIni(content)` - INI
- `parseXml(content)` - XML

### formatOutput(results, format)
差分結果をフォーマット（"json", "yaml", "diffx"）

## 開発ルール

- diffx-coreはcrates.ioの公開版を使用（ローカルパス依存禁止）
- index.js/index.d.tsはnapi-rsが自動生成、手動編集禁止
- コミット前にcargo fmtが自動実行される（husky）
