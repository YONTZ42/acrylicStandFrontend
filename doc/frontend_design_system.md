いい判断。
**ピンクを外してターコイズを軸にするのはかなり良い**です。理由は3つあります。

1. **男女どちらの推し活にも合う**
2. **アクリルの透明感と相性がいい**
3. **WebGPUのガラス表現と調和する**

ピンク中心だと「女性向けアプリ」に寄りすぎますが、
**ターコイズなら“ポップだけど中性的”**になります。

ここでは、あなたが気に入ってくれた設計（構造）をそのまま使って、
**カラー部分だけ再設計**します。

---

# Acrylic Pop System v2

### WEGOシンプル × サンリオ配色 × アクリル透明感

---

# 1. ブランドカラー設計

## メインカラー

**Turquoise Blue**

```
#00C2D6
```

印象

* 明るい
* 透明感
* デジタル感
* アクリル感
* 若さ

これはかなり重要。
**このアプリのブランドカラーになる。**

---

## メインカラー階層

### Primary

```
#00C2D6
```

### Primary Hover

```
#00A8BA
```

### Primary Soft

```
#E6FAFD
```

---

# 2. サブカラー設計

ターコイズは寒色なので、
**暖色のアクセントを入れるとポップになる。**

ここでは
**コーラル + ラベンダー + ミント**

の三色を使う。

---

## Secondary

**Coral Orange**

```
#FF7A59
```

用途

* CTAサブ
* 強調
* 人気
* バッジ

印象

* 元気
* 若い
* SNS感

---

## Accent

**Lavender**

```
#A78BFA
```

用途

* 限定
* エフェクト
* AI生成
* スタイル

印象

* サブカル
* アニメ
* かわいい

---

## Sub Accent

**Mint**

```
#2DD4BF
```

用途

* タグ
* UI装飾
* サブボタン

印象

* 爽やか
* 軽い

---

# 3. ベースカラー

ここはWEGO寄りにする。

## Background

```
#FAFEFF
```

ごく薄い青白

---

## Sub Background

```
#F2FBFD
```

セクション分け

---

## Surface

```
#FFFFFF
```

カード

---

# 4. テキストカラー

## Text

```
#1F2937
```

濃いグレー

---

## Muted

```
#6B7280
```

サブテキスト

---

## Soft

```
#9CA3AF
```

プレースホルダ

---

# 5. Border

## Border

```
#E5F3F7
```

---

## Border Strong

```
#CFE8EF
```

---

# 6. 完成カラーパレット

まとめ

```
Primary
#00C2D6

Primary Hover
#00A8BA

Primary Soft
#E6FAFD

Secondary
#FF7A59

Accent
#A78BFA

Mint
#2DD4BF

Background
#FAFEFF

Surface
#FFFFFF

Text
#1F2937
```

---

# 7. Tailwindテーマ

そのまま入れられる形にする。

```js
// tailwind.config.js

extend: {
  colors: {

    brand: {

      primary: "#00C2D6",
      "primary-hover": "#00A8BA",
      "primary-soft": "#E6FAFD",

      secondary: "#FF7A59",

      accent: "#A78BFA",

      mint: "#2DD4BF",

      bg: "#FAFEFF",
      "bg-soft": "#F2FBFD",

      surface: "#FFFFFF",

      text: "#1F2937",
      "text-muted": "#6B7280",
      "text-soft": "#9CA3AF",

      border: "#E5F3F7",
      "border-strong": "#CFE8EF",
    }

  }
}
```

---

# 8. ボタンカラー

## Primary Button

```
bg-brand-primary
text-white
rounded-full
shadow-soft
hover:bg-brand-primary-hover
```

---

## Secondary Button

```
bg-brand-secondary
text-white
rounded-full
hover:opacity-90
```

---

## Ghost Button

```
bg-brand-primary-soft
text-brand-primary
rounded-full
```

---

# 9. カード

## Standard Card

```
bg-white
border border-brand-border
rounded-3xl
shadow-soft
```

---

## Featured Card

```
bg-white
border border-brand-primary/30
shadow-md
rounded-3xl
```

---

# 10. バッジ

### New

```
bg-brand-primary
text-white
```

### 人気

```
bg-brand-secondary
text-white
```

### 限定

```
bg-brand-accent
text-white
```

### AI

```
bg-brand-mint
text-white
```

---

# 11. グラデーション

LP用

```
linear-gradient(
135deg,
#E6FAFD 0%,
#F5F9FF 40%,
#F7F1FF 100%
)
```

---

# 12. WebGPU領域

ここだけ特別にする。

```
bg-white/70
backdrop-blur-md
border border-white/40
```

ガラス感。

---

# 13. Gallery UI

一覧カード

```
bg-white
rounded-3xl
border border-brand-border
hover:border-brand-primary
```

---

# 14. ExhibitEditorModal

タブ

```
rounded-full
bg-brand-bg-soft
text-brand-text
data-active:bg-brand-primary
data-active:text-white
```

---

# 15. LP Hero

背景

```
bg-gradient-to-b
from-brand-bg
via-brand-primary-soft
to-white
```

---

# 16. ブランドの印象

この配色は

**爽やかポップ**

になる。

```
Apple × Canva × Webflow
```

みたいな雰囲気。

---
