# MDC — AI 編碼代理指南

> **專案**：`@sandlada/mdc` — Material Design 3 與 MD3 Expressive（MD3E）元件庫
>
> **定位**：基於 [Lit](https://lit.dev/) 與 Web Components，跨框架（Vue / Angular / React 等）可用的 UI 元件庫。
>
> **淵源**：本專案是 [@material/web](https://github.com/material-components/material-web) 的復刻與深度改進。原始專案已進入維護階段，本專案在此基礎上擴展 MD3 Expressive 規範支援、重構架構並引入新的開發約定。
>
> **當前版本**：`0.1.0-20250909.b`（alpha 階段，僅 `ripple` 與 `focus-ring` 進入正式構建）

---

## 專案概覽

- **套件名**：`@sandlada/mdc`（ESM，Node 模組類型 `module`）
- **目標**：MD3 / MD3E 規範下的 Web Components 元件庫，無框架鎖定
- **核心技術**：Lit 3 + `@lit/context` + Web Animations API + Web Components
- **建構系統**：`rolldown`（當前主動）+ `rollup`（過渡期殘留），詳見「構建說明」
- **當前活躍元件**：`src/all.ts` 中未註解的 22 個項目（其餘為 WIP）
- **當前正式打包元件**：`ripple`、`focus-ring` 兩者（`rolldown.config.js` 唯一 entry 集合）

---

## 快速參考

| 資源                        | 用途                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `package.json`              | 套件元資料、依賴、`exports` 對外入口                                |
| `tsconfig.json`             | TypeScript 設定（含 9 個 WIP 排除目錄，詳見「構建說明」）           |
| `rolldown.config.js`        | **當前主動建構器**（目前僅打包 `ripple` / `focus-ring`）            |
| `rollup.config.js`          | 前一代建構設定，未來將被 `rolldown` 取代；代理不應擴充              |
| `get-build-input-option.js` | 動態枚舉 `src/**/*.ts` 入口給 `rollup`（過渡期殘留）                |
| `src/all.ts`                | 元件 barrel：列示哪些已啟用、哪些 WIP（以註解標示）                 |
| `src/utils.ts`              | 工具 barrel：`attachable-controller` / `navigation` / `tokens`      |
| `src/definitions.ts`        | 元件註冊 barrel：re-export `src/component-definitions/*.definition` |
| `src/context-provider.ts`   | 全域 ripple / focusRing / elevation 設定（單例 + Lit context）      |

本檔案聚焦 AI 代理的工作流程與開發約定。

---

## Agent 行為規則

### 閱讀優先級

處理涉及元件程式碼的請求時，按以下順序閱讀檔案：

1. **`xxx.interface.ts`** — 元件契約（屬性、型別約束、`extends` 介面），**始終最先讀**
2. **`xxx.ts`** — 元件入口（`@customElement` 註冊、form-associated 宣告）
3. **`internal/base-xxx.ts`**（**注意命名順序**）— 內部基礎類別（mixins、樣式、複雜邏輯），僅當元件有 `internal/` 資料夾時
4. **`xxx.style.ts`** — 元件樣式

對於簡單元件（無 `internal/`），`xxx.ts` 包含全部實作，第 3 步跳過。

> **命名重要**：`internal/base-xxx.ts` 是「`base` 在前、檔名在後」，**不要**寫成
> `internal/xxx.base.ts`（這是錯誤慣例）。

### 元件複雜度分級

依原始碼結構分為三級（取代舊版二級制「有 / 無 internal/」）：

- **有 `internal/` 資料夾（9 個，複雜元件）**
  `button` / `dialog` / `fab` / `navigation` / `navigation-bar` /
  `segmented-button` / `slider` / `split-button` / `toolbar`

- **有頂層 `base-*.ts`（2 個，中等複雜）**
  `icon-button`（`base-icon-button.ts`） / `wave`（`base-wave.ts`）

- **單檔元件（18 個，簡單）**
  `badge` / `button-group` / `card` / `divider` / `draggable-modal` /
  `elevation` / `focus-ring` / `icon` / `navigation-drawer` /
  `navigation-rail` / `navigation-tab` / `popup-controller` /
  `progress-indicator` / `radio-button` / `ripple` / `search` / `switch` /
  `typography`

總計 29 個元件資料夾。

### 啟用 vs WIP 狀態速查

`src/all.ts` 中**未註解**為目前可從 `@sandlada/mdc/all` 引入的元件；
**以 `//` 開頭**的為 WIP（即使檔案存在也不可從套件入口取得）。

當前啟用：button（含 toggle）/ divider / elevation / fab / focus-ring /
icon / icon-button（含 toggle）/ navigation-bar / navigation-drawer /
navigation-rail / navigation-tab / radio-button / ripple / search /
segmented-button / slider / split-button / switch / tabs / typography

當前 WIP（被 `all.ts` 註解）：button-group / card / dialog /
draggable-modal / popup-controller / progress-indicator / toolbar
/ wave

### 無框架鎖定的黃金法則

- 元件是純 Web Components，在 Lit 內部使用裝飾器可接受
- **公開 API 必須遵守標準 Web Components 契約**：HTML 屬性、DOM 事件、slots
- 不要將 Lit 型別暴露在公開 API 中
- 不要在元件中引入框架特定的生命週期勾點（Vue / React 等）

---

## 元件生命週期

每個元件從開發到對外可用，需依序完成以下步驟：

1. **定義型別契約** — `src/components/{name}/{name}.interface.ts`
   定義 `I{name} extends LitElement` 介面 + `as const` 列舉常數
2. **實作內部基礎類別（若需要）** —
   `src/components/{name}/internal/base-{name}.ts`（`abstract`，不從套件入口導出）
3. **實作公開元件類別** —
   `src/components/{name}/{name}.ts`，以 `@customElement('mdc-{name}')` 註冊
4. **新增註冊定義** — `src/component-definitions/{name}.definition.ts`
   （24 個檔案，目前 20 個已從 `src/definitions.ts` 導出；其餘 WIP）
5. **掛入 barrel** — 在 `src/all.ts` 中**取消註解**對應的 `export *` 行
6. **擴充建構 entry**（僅在從 WIP 晉升到正式時）— 更新 `rolldown.config.js`

**WIP 排除警告**：`tsconfig.json` 目前排除 9 個目錄
（`card` / `dialog` / `button-group` / `draggable-modal` /
`popup-controller` / `progress-indicator` / `wave` / `toolbar` / `*-old`）。
在這些目錄下編輯時，`npm run build:rolldown:dts` **不會**捕捉型別錯誤，
必須手動 `npx tsc --noEmit` 或暫時移除排除規則才能驗證。

**遺留死代碼警告**：`deprecated-packages/vue-mdc/` 是已被 `@sandlada/mdc` 取代
的 Vue 3 包裝層，**禁止代理編輯、遷入、或重構**。任何涉及 Vue 整合的需求
應在新元件層處理。

---

## 開發約定

### 1. `composeMixin` 函式式多繼承

元件透過 `composeMixin()` 函式組合多個 mixin，而非傳統的 class 鏈式繼承：

```typescript
export abstract class BaseButton extends composeMixin(
    mixinDelegatesAria,    // ARIA 屬性委託
    mixinElementInternals, // ElementInternals 存取
    mixinRippleOptions,    // Ripple 效果控制
    mixinElevationOptions, // 陰影/高程控制
    mixinFocusRingOptions  // 焦點指示器控制
)(LitElement) {
    // ...
}
```

**可用 mixins 列表**（依當前原始碼事實）：

| Mixin                          | 來源檔案                                                | 用途                                                                           |
| ------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `mixinDelegatesAria`           | `src/utils/aria/delegate.ts`                            | 將 ARIA 屬性從 host 委託給 shadow root 內部元素                                |
| `mixinElementInternals`        | `src/utils/behaviors/element-internals.ts`              | 提供 `ElementInternals` 實例存取，供 form-associated 等 mixin 使用             |
| `mixinConnectedPromiseResolve` | `src/utils/behaviors/connected-promise-resolve.ts`      | 提供一個在首次連接時 resolve 的 Promise，用於協調非同步行為                    |
| `mixinConstraintValidation`    | `src/utils/behaviors/constraint-validation.ts`          | 增加約束驗證 API（`validity`、`reportValidity()`、`checkValidity()`）          |
| `mixinFormAssociated`          | `src/utils/form/form-associated.ts`                     | 使元素能夠參與原生 HTML `<form>` 提交（需要 `mixinElementInternals` 作為基類） |
| `mixinRippleOptions`           | `src/components/ripple/ripple-options.mixin.ts`         | 新增 ripple 控制屬性並暴露 `renderRipple()`                                    |
| `mixinElevationOptions`        | `src/components/elevation/elevation-options.mixin.ts`   | 新增 elevation 控制屬性並暴露 `renderElevation()`                              |
| `mixinFocusRingOptions`        | `src/components/focus-ring/focus-ring-options.mixin.ts` | 新增焦點環控制屬性並暴露 `renderFocusRing()`                                   |
| `mixinXROptions`               | `src/utils/xr/xr-options.mixin.ts`                      | 新增 `xr` 布林屬性並增強 `getRenderClasses()` 用於擴增實境情境                 |

**規則**：
- mixin 參數按職責從抽象到具體排列
- `composeMixin()(...)(LitElement)` — **`LitElement` 作為基類別**
- 子類別透過 `extends BaseXxx` 繼承，可繼續覆寫或追加 mixin
- `mixinFormAssociated` 必須在 `mixinElementInternals` 之後使用
- `mixinConstraintValidation` 必須在 `mixinFormAssociated` 之後使用

### 2. 檔案結構約定

每個元件資料夾依複雜度按以下模式組織：

**複雜元件（具 `internal/` 資料夾）**：

```
src/components/{name}/
├── {name}.ts                       # 公開元件類別，@customElement 註冊
├── {name}.style.ts                 # 元件樣式（可選）
├── {name}.interface.ts             # 元件介面（可選）
├── {name}-options.mixin.ts         # 選項混入（可選，僅當作為其它元件子元素時）
├── {name}-action.ts / sibling.ts   # 相關公開類別（可選）
├── toggle-{name}.ts                # 切換型變體（可選）
├── demo/*.demo.html                # 使用範例
├── README.md                       # 元件說明（可選）
└── internal/
    ├── base-{name}.ts              # 內部基礎類別（**注意：`base` 在前**）
    └── {name}.style.ts             # 基類樣式（可選）
```

**中等複雜（具頂層 `base-*.ts`）**：

```
src/components/{name}/
├── {name}.ts
├── base-{name}.ts                  # 基礎類別在頂層而非 internal/
├── {name}.style.ts
└── {name}.interface.ts             # 視需要
```

**簡單單檔元件**：

```
src/components/{name}/
├── {name}.ts                       # 全部實作，無 internal/
└── {name}.style.ts                 # 視需要
```

**Mixin 選項檔命名**：使用 `{name}-options.mixin.ts` 模式（**注意：`.mixin.ts`
是後綴**）。

- 檔案後綴統一為 `.mixin.ts`，與一般工具檔案區分
- `{name}` 部分與元件/模組名稱一致（如 `ripple`、`elevation`）
- 導出的 mixin 函式名稱保持 `mixin{Name}Options`（如 `mixinRippleOptions`）

### 3. render 根元素的 class 約定

`render()` 回傳的最外層 HTML 元素透過 `getRenderClasses()` 方法提供
`classMap` 資料：

```typescript
protected getRenderClasses() {
    return ({
        'container': true,
        [this.variant]: true,
        [this.shape]: true,
        [this.size]: true,
        'has-icon': this.hasIcon,
        'has-label': this.hasLabel,
        'disabled': this.disabled,
    })
}

protected override render(): TemplateResult {
    return html`
        <button class="${classMap(this.getRenderClasses())}">
            ...
        </button>
    `
}
```

**命名規則**：
- **`getRenderClasses()`** — 當最外層元素是**非 host 元素**（如 `<button>`、`<div>`、`<span>`），此為**預設**方式
- **`getHostClasses()`** — 當最外層元素是 **host 元素**（custom element 自身）時使用，目前為**未來約定**，新元件可選用
- 回傳物件與 `classMap` 指令配合使用
- `has-icon` / `has-label` 等語意化命名沿用 slot 偵測結果

**子類別覆寫模式**：

```typescript
protected override getRenderClasses() {
    return {
        ...super.getRenderClasses(),
        'extra-class': this.someCondition,
    }
}
```

### 4. 存取修飾詞必須顯式

**所有**類別成員都必須顯式標註 `public` / `protected` / `private`，不可省略：

```typescript
export abstract class BaseButton extends composeMixin(...)(LitElement) {
    public abstract variant: string                // ✅ 公開抽象
    public size: string = 'small'                  // ✅ 公開屬性
    protected hasIcon: boolean = false             // ✅ 受保護
    private handleIconSlotChange(e: Event) { }     // ✅ 私有
    // ❌ 禁止：variant: string — 缺少存取修飾詞
}
```

**Lit 裝飾器與修飾詞配合**：

```typescript
@property({ type: String })
public size = 'small'                              // ✅
@state()
protected hasIcon = false                          // ✅
@query('.container')
protected readonly buttonElement!: HTMLElement | null  // ✅
@property({ type: Boolean, reflect: true })
public readonly disabled: boolean = false          // ✅ readonly + reflect
```

### 5. 元件狀態三軸設計模式

元件透過 **variant / size / shape** 三個軸向定義視覺風格：

| 軸向      | 涵義     | 範例值                                                                 |
| --------- | -------- | ---------------------------------------------------------------------- |
| `variant` | 視覺變體 | `'filled'` / `'outlined'` / `'text'`                                   |
| `size`    | 尺寸     | `'extra-small'` / `'small'` / `'medium'` / `'large'` / `'extra-large'` |
| `shape`   | 形狀     | `'round'` / `'square'`                                                 |

```typescript
@property({ type: String })
public variant: string = 'filled'
@property({ type: String })
public size: 'small' | 'medium' | 'large' = 'small'
@property({ type: String })
public shape: 'round' | 'square' = 'round'
```

> 並非所有元件都需實作全部三個軸向。對於不適用的元件，可以選擇性省略。

### 6. Copyright 標頭

每個原始檔案必須以下列標頭開頭：

```typescript
/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
```

衍生自 Google / Material Web 的程式碼使用：

```typescript
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
```

---

## 元件定義（`component-definitions/`）模式

`src/component-definitions/*.definition.ts` 是**註冊用的薄層包裝**，
目的是讓應用程式可選擇性註冊元件（避免一次性載入所有元件造成 bundle 膨脹）。

**與 `src/all.ts` 的差異**：
- `all.ts` 透過 `import` 觸發 `@customElement` 自動註冊（Eager）
- `definitions.ts` 提供**手動呼叫**註冊函式的能力（Lazy / Selective）
- 兩者都依賴 `src/components/{name}/{name}.ts` 的 `@customElement` 裝飾器

**何時新增**：
- 為每個**已啟用**的元件（`all.ts` 未註解）都應有對應的 `.definition.ts`
- 24 個定義檔案中，目前 20 個已從 `src/definitions.ts` 導出；其餘為尚未完成

**已啟用定義（20 個）**：
`badge` / `button` / `checkbox` / `dialog` / `divider` / `elevation` /
`fab` / `focus-ring` / `icon` / `icon-button` / `navigation-bar` /
`navigation-rail` / `navigation-tab` / `progress-indicator` /
`radio-button` / `ripple` / `slider` / `switch` / `tab` / `tabs`

**尚未導出定義（4 個）**：`card` / `search` / `toolbar` / `typography`

---

## Demo 慣例

- **位置**：`src/components/{name}/demo/*.demo.html`（toggle 變體沿用 `button/demo/` 與 `icon-button/demo/`）
- **無 demo runner script** — demo HTML 由 docs 站靜態託管
- **命名規則**：`{comp-name}.{prop}.demo.html`（prop 採 kebab-case HTML attribute 名；slot / feature 名稱亦可作為 feature 軸，例如 `button.icon.demo.html`）。每個檔案展示**同一個 prop / feature 軸**的多個取值
- **格式**：純 HTML 片段（無 `<!doctype>` / `<html>` / `<script>`），垂直堆疊 `<mdc-{component}>` 實例，標籤透過元件文字內容
- **目前所有啟用元件（21 個 class，含 toggle-button / toggle-icon-button）均具備 per-prop demo**
- **新規範**：新增啟用元件（含 toggle 變體）時須為每個 `@property` 反射的 prop 建立對應 demo 檔案

範例（參考 `src/components/button/demo/button.variant.demo.html`）：

```html
<mdc-button variant="filled">Filled</mdc-button>
<mdc-button variant="outlined">Outlined</mdc-button>
<mdc-button variant="text">Text</mdc-button>
```

---

## 構建說明

**當前狀態**：專案正在從 `rollup` 遷移到 `rolldown`（過渡期）。

### 構建腳本

| 指令                         | 用途                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| `npm run build:rolldown`     | 透過 `rolldown.config.js` 打包。**目前僅產出 `ripple` / `focus-ring`（4 個 entry）** |
| `npm run build:rolldown:dts` | 產出 `.d.ts` 型別宣告至 `build/`                                                     |

**目前** `package.json` 只有上述兩個 script；`dev` / `test` / `lint` 皆**未設定**。

### `rolldown.config.js`（當前主動）

- 當前 entry 集合（4 個）：
  - `components/ripple/ripple`
  - `components/ripple/ripple-options.mixin`
  - `components/focus-ring/focus-ring`
  - `components/focus-ring/focus-ring-options.mixin`
- 輸出：`build/`，ESM、minify、sourcemap、`preserveModules: true`
- 平台：`browser`，`tsconfig: ./tsconfig.json`
- Plugin：`rollup-plugin-html-literals`

### `rollup.config.js`（過渡期殘留）

- 透過 `get-build-input-option.js` 動態枚舉 `src/**/*.ts` 作為入口
- 未來會被 `rolldown.config.js` 取代
- **代理不應擴充或修改** rollup 設定

### `tsconfig.json` WIP 排除目錄

```
./src/**/dialog/*
./src/**/button-group/*
./src/**/card/*
./src/**/*-old/*
./src/**/draggable-modal/*
./src/**/popup-controller/*
./src/**/progress-indicator/*
./src/**/wave/*
./src/**/toolbar/*
```

**原因**：上述 9 個目錄的元件尚未重構完成，編譯會失敗。

**過渡期提醒**：代理在編輯被排除目錄下的元件時，`build:rolldown:dts` **不會**
捕捉型別錯誤，必須手動 `npx tsc --noEmit` 或暫時從 `exclude` 移除才能驗證。

---

## 套件入口

消費者透過 `package.json` 的 `exports` 從以下三個入口匯入：

| 入口                        | 用途                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `@sandlada/mdc/all`         | **Eager 載入**所有已啟用元件（透過 `import` 觸發 `@customElement`） |
| `@sandlada/mdc/definitions` | **Selective 載入** — 從 `src/definitions.ts` 取得註冊函式           |
| `@sandlada/mdc/utils`       | 工具集合：`attachable-controller` / `navigation` / `tokens`         |
| `@sandlada/mdc/*`（萬用）   | 直接子路徑載入，例如 `@sandlada/mdc/components/button/button`       |

---

## 全域上下文（`src/context-provider.ts`）

`_GlobalMDCContextProvider`（透過 `_GlobalMDCContextProvider.Instance` 暴露
為 `GlobalMDCContextProvider`）是**單例**，用於集中管理應用程式層級的
ripple / focusRing / elevation 設定，並透過 `@lit/context` 散佈給所有元件。

**三個設定區段**：
- `GlobalMDCContextRippleConfig` — 包含 `disabled`、
  `disableHoverStateLayer` / `disableFocusStateLayer` / `disablePressStateLayer`
- `GlobalMDCContextFocusRingConfig` — `disabled`
- `GlobalMDCContextElevationConfig` — `disabled`

**呼叫模式**：

```typescript
import { GlobalMDCContextProvider } from '@sandlada/mdc/context-provider'

GlobalMDCContextProvider.attach({
    ripple: { disabled: false },
    focusRing: { disabled: false },
    elevation: { disabled: false },
})

// 之後可更新
GlobalMDCContextProvider.setConfig({ ripple: { disabled: true } })
```

> 元件內部透過 `mixinRippleOptions` / `mixinFocusRingOptions` /
> `mixinElevationOptions` 自動消費此 context。

---

## 關鍵檔案速查

| 檔案路徑                                                         | 用途                                               |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| `src/utils/compose-mixin/compose-mixin.ts`                       | `composeMixin()` 實作                              |
| `src/utils/controller/selection-controller.ts`                   | radio/checkbox 選取控制器                          |
| `src/utils/controller/measured-dimension-controller.ts`          | 尺寸測量控制器                                     |
| `src/utils/controller/edge-slide-controller.ts`                  | 邊緣滑動控制器（用於 navigation-drawer / toolbar） |
| `src/utils/controller/opacity-transition-controller.ts`          | 透明度過渡控制器（badge / button 等使用）          |
| `src/utils/navigation/navigation-state-store.ts`                 | 導覽狀態儲存                                       |
| `src/context-provider.ts`                                        | 全域 ripple / focusRing / elevation 設定單例       |
| `src/utils/aria/delegate.ts`                                     | `mixinDelegatesAria`                               |
| `src/utils/behaviors/element-internals.ts`                       | `mixinElementInternals`                            |
| `src/utils/form/form-associated.ts`                              | `mixinFormAssociated` + `setupFormSubmitter`       |
| `src/components/button/internal/base-button.ts`                  | getRenderClasses + composeMixin 範例               |
| `src/components/button/toggle-button.ts`                         | override getRenderClasses + form-associated 範例   |
| `src/components/navigation-tab/navigation-tab.ts`                | interface + component 範例                         |
| `src/components/divider/divider.ts`                              | 無 mixin 的簡單元件範例                            |
| `src/components/badge/badge.ts`                                  | badge 簡單元件代表（MD3E 規範）                    |
| `src/components/toolbar/internal/base-docked-toolbar.ts`         | toolbar 複雜元件代表（具 `internal/`）             |
| `src/components/wave/base-wave.ts`                               | wave 中等複雜元件代表（具頂層 `base-*.ts`）        |
| `src/components/progress-indicator/linear-progress-indicator.ts` | 進度指示器代表（含動畫）                           |
