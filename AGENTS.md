# MDC — AI 編碼代理指南

> **專案**：`@sandlada/mdc` — Material Design 3 與 MD3 Expressive（MD3E）元件庫
> **定位**：基於 [Lit](https://lit.dev/) 與 Web Components，跨框架（Vue / Angular / React 等）可用的現代 UI 元件庫。
> **架構**：Monorepo 工作區（主要套件位於 `packages/mdc/`），純 `rolldown` 打包 + `vitest` 測試驅動。
> **技術基線**：**Chrome 150+** / **CSS Baseline 2026** / **ECMA Next**（面向未來標準，零向後相容包袱）。
> **唯一事實來源**：本文件為 AI 代理唯一 master 指南；`CLAUDE.md` 即將被移除，衝突以本文件為準。

---

## 1. 核心編碼風格與語法規範

### 代碼格式基準

- **縮排**：嚴格使用 **4 Spaces**，禁止 Tab。
- **換行**：統一採用 **LF**。
- **分號**：**無行尾分號**（No Semicolons），保持代碼乾淨現代。

### Copyright 標頭

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

### 範式劃分與設計邊界

- **Web Components 元件（UI 實體與基類）**：
  - 統一採用 **`class`** 宣告（繼承 `LitElement` 或抽象基類 `Base*`）。
  - 所有類別成員必須**顯式標註存取修飾詞**（`public` / `protected` / `private`）。
  - 對外 API 嚴守標準 Web Components 契約（HTML 屬性、DOM 事件、Slots），禁止暴露框架專屬型別或生命週期勾點。
- **非 Web Components（工具、算法、轉換器、Tokens 等）**：
  - 嚴格採用**純函數式（Functional）+ 高階函數（Higher-Order Functions）+ 參數/數據後置（Data-Last / Currying）**。
  - 設計便於透過 `pipe(...)` 進行線性鏈式組合。
- **Mixins（混入器）**：
  - 採用**接收基類並返回擴充類別的高階函數**模式，搭配 `composeMixin(...)` 組合多個 mixins。

```typescript
// ✅ 非 Web Components：純函數 + 高階柯里化 + 數據後置（Data-Last）
export const multiply = (factor: number) => (value: number): number => value * factor
export const add = (offset: number) => (value: number): number => value + offset

const computeResult = (input: number) => pipe(
    input,
    multiply(2),
    add(10)
)

// ✅ Web Components：Class + 顯式存取修飾詞 + composeMixin
export abstract class BaseButton extends composeMixin(
    mixinDelegatesAria,
    mixinElementInternals,
    mixinRippleOptions,
    mixinFocusRingOptions
)(LitElement) {
    @property({ type: String })
    public variant: 'filled' | 'outlined' | 'text' = 'filled'

    @property({ type: Boolean, reflect: true })
    public disabled = false

    protected getRenderClasses() {
        return {
            'container': true,
            [this.variant]: true,
            'disabled': this.disabled
        }
    }
}
```

---

## 2. 現代標準與設計原則

### 面向未來與零托底原則（Zero Legacy）

- **標準優先**：以 Chrome 150+、CSS Baseline 2026 與最新 ECMAScript 規範為唯一基準。
- **嚴禁降級兼容**：禁止編寫針對舊版瀏覽器的 polyfill、vendor prefix、feature detection fallback 或降級替代分支。
- **Breaking Change 優先**：功能變遷直接採用破壞性變更，無需提供舊版 alias，不做版本托底與 deprecation 過渡期。舊 API 直接移除，不保留兼容墊片。
- **面向未來的測量標準**：採用最新技術（ECMAScript / CSS / HTML 最新標準、Chromium 最新版本技術），
  同時拒絕過時與快過時的技術（例如 IE、Edge 舊 API、被 MDN 標記為廢棄的 API）。

### 樣式單一事實來源（SSOT）與零 Fallback 規則

- SSOT 僅約束架構與數據（tokens / 定義），文檔與註釋中的規則複述不在此限。
- 元件內部 CSS 規則直接使用注入在 `:host` 的 `--_*` 私有變數（例如 `var(--_enabled-container-color)`）。
- **嚴禁手動在 CSS 內部編寫第二參數 fallback**（如 ❌ `var(--_enabled-container-color, #fff)`）。所有預設值與系統回退鏈由 `src/component-definitions/*.definition.ts` 透過 `createStyleDefinition()` 統一注入 `:host`。
- 僅在組件動態計算且未於 definition 定義的樣式變數（如 `--_carousel-computed-large`）才允許 inline fallback。

### 錯誤處理規範

- 運行時錯誤使用 JS `Error` 異常系統（`throw new Error(...)`），禁止返回碼 / 哨兵值，禁止吞異常（呼應快速失敗）。

### 無障礙規範（Accessibility / a11y）

每個元件的 UI 設計與樣式實作都必須滿足無障礙標準（WCAG 2.2+），含 `prefers-contrast: more` / `less`：

- **強制色彩（`forced-colors: active`）**：使用系統色彩關鍵字（`Canvas`, `CanvasText`, `Highlight`,
  `HighlightText`, `ButtonText`, `GrayText` 等）；必要時設 `forced-color-adjust: none` 維持元件結構，
  並顯式定義系統色背景、文字與對比外框（如 `outline: 1px solid CanvasText`），確保所有互動狀態
  （hover / focus / active / disabled）在強制色彩下清晰可辨。
- **對比度偏好（`prefers-contrast`）**：`more` 增強文字與容器邊界（如 `CanvasText` 外框、加粗邊框）；
  `less` 適度降低視覺刺眼度（如柔化邊框）。
- **減少動態（`prefers-reduced-motion: reduce`）**：停用或簡化過渡動畫（`animation: none` / `transition: none`）。
- **降低透明度（`prefers-reduced-transparency: reduce`）**：移除 `backdrop-filter` 與半透明遮罩，替換為 100% 純色實體背景。

---

## 3. 元件結構與開發約定

### 檔案閱讀與開發優先級

1. **`{name}.interface.ts`** — 元件對外契約與介面定義（最先閱讀）
2. **`{name}.ts`** — 公開元件類別（`@customElement('mdc-{name}')`）
3. **`internal/base-{name}.ts`** — 內部抽象基類（純邏輯/狀態/Mixins，命名固定 `base-` 在前）
4. **`{name}.style.ts`** — 元件完整樣式（集中管理，**禁止建立 `base-*.style.ts`**）

### 檔案目錄組織

```
packages/mdc/src/components/{name}/
├── {name}.ts                       # 公開自訂元素類別
├── {name}.style.ts                 # 完整樣式（Base + Variant + Tokens 集中管理，樣式不抽象）
├── {name}.interface.ts             # 介面契約與枚舉（三檔接口：Props / Events / 實例）
├── {name}-options.mixin.ts         # 供其他元件嵌入的 Mixin（可選，命名 *.mixin.ts）
├── demo/*.demo.html                # 靜態 HTML 片段 Demo
└── internal/
    └── base-{name}.ts              # 內部抽象基類（純邏輯抽象）
```

### render 根元素 class 約定

`render()` 回傳的最外層元素透過 `getRenderClasses()` 提供 `classMap` 資料：

```typescript
protected getRenderClasses() {
    return {
        'container': true,
        [this.variant]: true,
        'has-icon' : this.hasIcon,
        'disabled' : this.disabled
    }
}

protected override render(): TemplateResult {
    return html`
        <button class="${classMap(this.getRenderClasses())}">
            ...
        </button>
    `
}
```

- **`getRenderClasses()`** — 最外層為**非 host 元素**（如 `<button>`、`<div>`）時的預設方式。
- **`getHostClasses()`** — 最外層為 **host 元素**（custom element 自身）時使用，目前為未來約定。
- 子類別擴展時 spread 父類結果：

```typescript
protected override getRenderClasses() {
    return {
        ...super.getRenderClasses(),
        'extra-class': this.someCondition
    }
}
```

### 元件狀態三軸模式

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

> 並非所有元件都需實作全部三個軸向；不適用者可省略。

### 介面契約規範（`{name}.interface.ts` 三檔接口）

所有元件的介面定義必須嚴格劃分為三檔，統一採用**複數**名詞與 **`IMDC`** 前綴，提供跨框架對接與型別安全的標準契約：

1. **屬性接口（Attributes）** — `IMDC{PascalName}Attributes`：純輸入屬性集合，不含 DOM/Lit 生命週期與方法。
2. **事件接口（Events）** — `IMDC{PascalName}Events`：輸出事件映射表（`'event-name': EventType`）。
3. **實體接口（Instance）** — `IMDC{PascalName}`：元件總接口，繼承 `LitElement`、`IMDC{PascalName}Attributes` 與各項 Mixins/Methods。

```typescript
// 範例：packages/mdc/src/components/icon/icon.interface.ts
import type { LitElement } from 'lit'

// 1. 輸入屬性接口
export interface IMDCIconAttributes {
    name       : string | undefined
    filled     : boolean
    weight     : number
    grade      : number
    opticalSize: number
}

// 2. 輸出事件映射表
export interface IMDCIconEvents {
    'click': MouseEvent
}

// 3. 實例總接口
export interface IMDCIcon extends LitElement, IMDCIconAttributes {
    // 公開方法或特定實例行為
}
```

### 元件生命週期與註冊步驟

1. **介面契約**：在 `{name}.interface.ts` 定義 `IMDC{name}Attributes`、`IMDC{name}Events`、`IMDC{name}` 與相關枚舉。
2. **邏輯基類**：複雜元件在 `internal/base-{name}.ts` 組合 mixins 與狀態邏輯。
3. **公開元件**：在 `{name}.ts` 導出並標註 `@customElement('mdc-{name}')`。
4. **註冊定義**：在 `src/component-definitions/{name}.definition.ts` 宣告 tokens 映射。
5. **Barrel 導出**：在 `src/definitions.ts` 與 `src/all.ts` 導出元件。

### 功能資料夾 Barrel 導出規範（`index.ts`）

- 深層功能資料夾（例如 `utils/styles/`、`utils/aria/`）內部必須有 `index.ts`，
  統一導出該資料夾的公共 APIs；外部只透過 barrel 取用，不直引內部檔案。
- **禁止頂層大桶**：禁止 `utils/index.ts` 與 `components/index.ts`，
  保持子路徑精確載入（對應 `package.json` 的 `@sandlada/mdc/*` 子路徑導出），避免循環依賴與打包膨脹。

### 樣式定義命名規範（`createStyleDefinition`）

Token 命名嚴格遵循：**`[狀態-]?[尺寸-]?[元素-][屬性][-selected|-checked]?`**

- **狀態前綴**：`enabled-*` / `hovered-*` / `pressed-*` / `focused-*` / `disabled-*`（預設狀態必須加 `enabled-`）。
- **容器元素標示**：最外層容器屬性必須帶 `container-*`（例如 `enabled-container-height`）。
- **圓角展開為四角**：`*-shape-start-start` / `*-shape-start-end` / `*-shape-end-start` / `*-shape-end-end`。
- **方向屬性全展開**：Margin / Padding 必須拆分為 4 獨立欄位（`*-padding-inline-start`, `*-padding-inline-end`, `*-padding-block-start`, `*-padding-block-end`）。
- **字體屬性 6 要素**：文字 token 須包含 `font`、`size`、`line-height`、`weight`、`tracking`、`opacity`。

### Demo 規範

- 放置於 `packages/mdc/src/components/{name}/demo/{comp-name}.{prop}.demo.html`。
- 純 HTML 片段（不含 `<html>` 或 `<script>`），為每個 `@property` 建立獨立的 demo 展示。

---

## 4. 測試規範與 TDD 工作流

### 規格先行（Spec-First / Black-Box）

- **黑盒測試**：測試斷言必須純粹依據業務規格、數學定義與介面契約**獨立推導期望值**。
- **嚴禁迎合實現**：不得以當前代碼的實際輸出（Actual）反向填寫測試期望（Expected）。
- **只修代碼原則**：測試失敗時默認為代碼 Bug，**只修改源碼，嚴禁篡改測試斷言**（除非規格本身變更）。
- **測試先行、輪詢實現**：實現代碼前先編寫測試，以測試結果為唯一指引輪詢實現功能
  （Red → Green → 重構）；紅燈時只修實現、不改期望，循環直至全綠。

### 快速失敗（Fail-Fast）設計思想

- 非法輸入必須顯性失敗（丟棄 + `warn` / 拋異常），**拒絕隱性 bug**：
  禁止靜默透傳無效語法、禁止靜默修復、禁止吞異常。
- 既有實踐：at-rules 的 R1 缺 selector/target、空 `@variant()` / `@when()` 表頭、
  R8 全部分支零匹配一律 `[D]` 丟棄整塊（見 At-Rules 樣式編譯規格小節）。

### 閉環迭代流程

1. **規格推導**：梳理邊界（開閉區間、極端數值 ±1px、空值、異常輸入、RxJS 取消訂閱無洩漏）。
2. **編寫測試（Red）**：編寫 `*.spec.ts` 捕捉需求邊界。
3. **實現業務（Green）**：以最精簡的函數式/類別代碼通過測試。
4. **驗證（Loop）**：執行 `npm test`，目標 100% 全綠（Exit Code 0）；
   快速開發模式下包容已知基線清單內失敗，**清單外新增失敗必須清零**。

### At-Rules 樣式編譯規格（`packages/mdc/src/utils/styles/compiler/at-rules/`）

測試骨架：

- 每份 `transform-*.spec.ts` 遵循同一骨架：`MappingRow = [input, expected: string | string[]]`，
  `canonical` 只做 `\r\n` 統一 + 首尾 `trim`（空白敏感），`greenMapping` / `redMapping` 雙迴圈，
  `it` 標題自動生成（`green: ...` / `red: ...`），無需手寫。
- 雙隊斷言相同（精確相等），**不看 `warn`**：警告計數與 `absent` / `present` 歸
  `at-rules-compiler.spec.ts` Adversarial Suite（該表 `expected: null` 表示跳過輸出斷言，只斷 warn/包含）。
- 期望形狀：一個頂層殼用 `string`，多個頂層殼用 `string[]`；嵌套尊重外層殼用單字串
 （`:host([disabled])` 觸發 H1 殼分裂時用陣列；選錯形狀測試必紅）。

紅綠定義：

- 綠隊 = 期待的輸入 + 期待的結果；紅隊 = 不期待的輸入 + 期待的輸出
  （修正後的輸出，即 `[P]` 語義透傳），或不期待的輸入 + 不期待的輸出
  （指定必須報錯的用法，即 warn / throw 斷言，見 Adversarial Suite）。
  此處紅綠僅指合法 / 非法分流，並非 TDD 的 Red（先寫失敗測試）/ Green（讓它通過）。
- 安全失敗兩形（行內以 `[P]` / `[D]` 標註）：`[P]` 語義透傳（不展開、不提升、保留嵌套；
  `@when` 包裝剝離，非字串全等）；`[D]` 丟棄（輸出空字串，不輸出空殼、不拋異常、不靜默修復）。
- 紅隊保留輸出必須為合法 CSS，否則丟棄。

規則速查：

- `@state`：R1 target/selector 皆必填（缺一即 `[D]`）；R2 全量替換、尾部追加（偽元素之前）；
  R3 函數參數與屬性值內子字串永不匹配；R4 連字前綴不算；R5 逗號分支獨立注入
  （無 target 分支原樣保留，走展開路徑）；R6 保留嵌套；R7 `& button` 正規化、單獨 `&` 不反解；
  R8 全部分支零匹配即 `[D]`（含頂層 scope 包裝；嵌套收斂為空外層殼，接受）。
- `:host`：H1 殼分裂；H2 零 `&`；H3 括號內合併；H4 `:is/:where` 包裹視為 host-target。
- `:state()`：S1 掛元素；S2 掛 `:host` 括號內合併；S3 與 `@when` 協同提升。
- `@variant`：V1 單名單殼；V2 多名逗號並殼；V3 殼內並列。通配 `*` / 否定 `!name` 不收錄於 mapping。
- `@when`：W1 須顯含 `:host`（否則保留嵌套、不提升）；W2 提升為最近隔離容器頂層外殼；
  W3 零 `&`；W4 多條件並列單外殼。
- combo 笛卡爾積順序固定 `[medium,enabled] → [medium,disabled] → [large,enabled] → [large,disabled]`，
  狀態掛 `@state(target)` 的 target 上。
- 發射規則：空 body 且該 state 無定義（null / 缺失）者該殼不發射；有內容恆發射；純靜態 def 全量發射。
- hoist 三分支：variant 優先合併 → ancestorPath[0] host 根合併 → 原樣；
  `wrapWithAncestorPath` 中 `path[0]` 為最外層，`& .inner` → `.inner`，`&` 本體 / 空段丟棄該層。

規格變更例外程序：

- 只修代碼原則之唯一例外是規格本身變更：須同步修正期望，並在 spec 註解載明原因。
  既有例外：R1 包回→丟棄、R8 透傳→丟棄、
  綠表頂層 scope 零匹配移入紅表。

已知基線（2026-09-07）：

- at-rules 實現 backlog 10 項（9 綠隊殼分裂形狀漂移 + 1 `:hostx` 前綴誤匹配真衝突）。
- 另 3 組件舊賬（divider / elevation / playground，經 stash 隔離驗證與本系列改動無關）。
- 待定行為：未知維度名、未知變體名、截斷輸入、非法名單包 `@state`、無 registry 未知 `:state` 名
  （見各 spec `待定` 註解）。

新增用例三步：先判綠/紅 → 再選形狀 → 命名自動。執行
`npm test -- transform-state transform-variant transform-when hoist-helpers at-rules-integration at-rules-compiler`，
全量回歸 `npm test`（`packages/mdc`）與 `npm test`（`packages/vscode-mdc`）。

### Spec 版本鎖定（`@version`）

- 現階段僅 spec 標註版本，實現暫不標註：每份 spec 在檔案頭 docblock 首行標
  `@version YYYY.M.D`（CalVer，例 `@version 2026.9.7`）。
- 版本號鎖定在 spec 上：spec 撰寫完畢即鎖定；只有契約變更（期望行、規則語義、形狀）
  才 bump，純註解 / 文字潤飾不 bump。
- **版本號更新必須由用戶手動指定**：agent 不得自行 bump 或改寫任何 `@version` 行；
  spec 契約變更完成後，向用戶提請版本決斷。
- 漂移定義（`check-spec-versions` 腳本判定，結論只有兩種）：
  - `匹配`：spec 帶有效 `@version` 且其配對測試全過。
  - `漂移`：spec 缺 `@version`，或配對測試失敗。
- spec bump 後：跑測試，全過即 `匹配`；掛紅即 `漂移`，修復 / 重構時實現優先跟進到 spec。
- 禁止脫離 spec 修改實現：任何實現改動必須由某 spec 的紅燈驅動（只修代碼原則）。
  脫離 spec 的改動即使測試全過也視為違規漂移，以流程約束（非腳本）捕捉。
- 腳本只檢查、不修改：`packages/mdc/scripts/check-spec-versions.mjs`，獨立指令
  `npm run check:spec-versions`（不接入 `test` 入口）；輸出每份 spec 的版本 / 測試 / 結論
  （匹配 / 漂移），存在漂移則 exit code 非零。
- 配對表（1:1，嚴格執行）：`transform-state.spec.ts` ↔ `transform-state.ts`、
  `transform-variant.spec.ts` ↔ `transform-variant.ts`、
  `transform-when.spec.ts` ↔ `transform-when.ts`、
  `hoist-helpers.spec.ts` ↔ `hoist-helpers.ts`。
- 豁免清單（將來實現落戳階段不參與配對比對，現階段無影響）：共享實現（`replace-target.ts`、dispatcher、
  `transform-rule.ts`、`transform-isolation.ts` 等）不標版本，其正確性由覆蓋它們的 specs 測試結果擔保；
  組合 spec（`at-rules-integration.spec.ts`、`at-rules-compiler.spec.ts`）照常標版本、照常判定，
  其版本獨立推進（無單一實現對應）。

---

## 5. 構建、模組與實戰避坑

### 構建與工作區指令

- **工作區路徑**：根目錄為 Monorepo，元件主要代碼位於 `packages/mdc/`。
- **常用指令**：
  - `npm run build` — 使用 `rolldown` 動態掃描並打包所有非 WIP 元件（輸出至 `build/`）。
  - `npm run build:dts` — 產出 TypeScript `.d.ts` 宣告檔。
  - `npm test` — 執行 `vitest` 單元測試套件。

### 模組入口 (`package.json`)

- `@sandlada/mdc/all` — Eager 載入並自動註冊所有元件。
- `@sandlada/mdc/definitions` — Selective 手動註冊定義。
- `@sandlada/mdc/utils` — 核心工具與 Tokens 計算函式庫。
- `@sandlada/mdc/*` — 元件子路徑精確載入。

### 提交與分支規範

- commit / PR 標題格式：`{type}: {message}`，type 限
  `feat | chore | docs | refactor | fix | ai | test | extension`；
  其中 `ai` 指對 `AGENTS.md` 的提交，`extension` 指對 `vscode-mdc` 包的提交；
  支持指定範圍，例如 `feat(button)`。
- 分支名稱格式：`type/name`。

### 關鍵偵錯與避坑指南

1. **動畫行為必須即時驗證**：Headless 模式搭配 `--virtual-time-budget` 會凍結 `@layer` 陰影樹動畫；驗證動畫必須透過即時 Chrome CDP 連線與真實延時。
2. **狀態動畫規則按 Variant 限縮**：共用狀態 class（如 `.indeterminate`）必須限定 variant 選擇器（如 `:host([variant='circular']) .indeterminate`），避免變形扭曲。
3. **Lit CSS 註解禁用反引號**：`css` 模板字串的註解內不可出現反引號，否則會破壞模板字串解析導致構建崩潰。
4. **Slider 垂直方向映射**：CSS `writing-mode: vertical-lr` 下邏輯頂部為 0；垂直標準模式（由下至上增加）在計算渲染時必須將 `isVisualReversed` 視為倒序，並為原生 range input 設定 `dir="rtl"`。
