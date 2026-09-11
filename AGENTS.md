# MDC — AI 編碼代理指南

> `@sandlada/mdc` — Lit + Web Components 的 MD3 / MD3E 元件庫，跨框架可用。Monorepo（`packages/mdc/` 為主），`rolldown` 打包 + `vitest` 測試，基準 Chrome 150+ / CSS Baseline 2026 / ECMA Next。
> 本文件為架構唯一聲明；產品語義以各包 `SPEC-*.md` 為準（衝突時 SPEC 勝）。agent 不得新增或修改 SPEC 語義（含測試期望語義側），拿不準先問。

---

## 1. 編碼風格與範式

- 格式以 `.editorconfig` 為準；TS 一律無行尾分號。
- Copyright：新檔用 MIT（Kai-Orion & Sandlada）；衍生 Google / Material Web 用 Apache-2.0。
- Web Components：一律 `class`（繼承 `LitElement` 或 `Base*`），成員顯式標 `public` / `protected` / `private`，對外只用 HTML 屬性、DOM 事件、Slots，禁框架專屬型別。
- 非 Web Components（工具、算法、tokens）：純函數 + 高階函數 + 數據後置（Data-Last / Currying），以 `flow(f, g)(x)` 組合，不另設 `pipe`。
- Mixins：接收基類並返回擴充類別的高階函數，以 `composeMixin(...)` 組合。

---

## 2. 標準、樣式與錯誤

- 零托底：禁 polyfill、vendor prefix、feature detection fallback、舊版 alias 與 deprecation 過渡期，變遷直接 breaking。
- SSOT 僅約束架構與數據（tokens / 定義）。元件 CSS 直接用 `:host` 注入的 `--_*` 私有變數。
- 禁 CSS 第二參數 fallback（如 `var(--_x, #fff)`）；預設值與回退鏈由 `src/component-definitions/*.definition.ts` 經 `createStyleDefinition()` 注入。僅未於 definition 定義的動態計算變數允許 inline fallback。
- 錯誤一律 `throw new Error(...)`；禁返回碼、哨兵值、吞異常。
- a11y（WCAG 2.2+）：`forced-colors` 用系統色 + 對比外框並覆蓋各互動狀態；`prefers-contrast: more` 加框、`less` 柔化；`reduced-motion` 停動畫；`reduced-transparency` 去半透明與 `backdrop-filter`。

---

## 3. 元件約定

### 檔案與目錄

閱讀優先級：`{name}.interface.ts` → `{name}.ts`（`@customElement('mdc-{name}')`）→ `internal/base-{name}.ts` → `{name}.style.ts`（樣式集中管理，禁 `base-*.style.ts`）。

```
packages/mdc/src/components/{name}/
├── {name}.ts
├── {name}.style.ts
├── {name}.interface.ts
├── {name}-options.mixin.ts        # 可選
├── demo/{comp-name}.{prop}.demo.html
└── internal/base-{name}.ts
```

### 渲染與狀態

- 非 host 根元素用 `getRenderClasses()` + `classMap`；host 自身用 `getHostClasses()`；子類 spread `super` 結果再擴展。
- 狀態三軸（不適用可省略）：`variant`（如 `filled` / `outlined` / `text`）、`size`（`extra-small` ~ `extra-large`）、`shape`（`round` / `square`）。
- 介面三檔（複數 + `IMDC` 前綴）：`IMDC{Pascal}Attributes`（純輸入屬性）、`IMDC{Pascal}Events`（`'event-name': EventType` 映射）、`IMDC{Pascal}`（繼承 `LitElement` + Attributes + mixins / 方法）。
- 新元件步驟：定 interface → 寫 `internal/base-{name}.ts`（複雜者）→ 寫 `{name}.ts` → 加 `component-definitions/{name}.definition.ts` → 於 `src/definitions.ts` 與 `src/all.ts` 導出。
- Barrel：深層資料夾以 `index.ts` 導出、外部禁直引內檔；禁 `utils/index.ts` 與 `components/index.ts` 頂層大桶。
- Token 命名：`[狀態-]?[尺寸-]?[元素-][屬性][-selected|-checked]?`。預設狀態加 `enabled-`；容器屬性帶 `container-*`；圓角展四角；Margin / Padding 拆四邊；文字備齊 `font`、`size`、`line-height`、`weight`、`tracking`、`opacity`。
- Demo：`demo/{comp-name}.{prop}.demo.html`，純 HTML 片段，每個 `@property` 一個檔案。

---

## 4. 測試與 Spec

- 黑盒先行：期望值依規格獨立推導，禁以實際輸出回填；失敗時只修源碼不改斷言（除非規格變更）；流程 Red → Green → 重構。
- 快速失敗：非法輸入顯性失敗（丟棄 + `warn` / 拋異常），禁靜默透傳、修復、吞異常。at-rules 側 R1 缺 selector / target、空 `@variant()` / `@when()` 表頭、R8 全分支零匹配一律丟整塊。
- 驗證：`npm test` 目標全綠；僅容忍已知基線清單，清单外新增失敗必須清零。
- styles 包三源：契約 `packages/styles/SPEC-at-rules.md`、骨架 `packages/styles/TESTING.md`、任務 `packages/styles/TASK.md`；引用只用規則編號（如 R8、W1），禁引行號。
- `@version`：僅 spec 在檔頭 docblock 首行標 CalVer；agent 禁 bump 或改寫；禁脫離 spec 紅燈改實現；判定與豁免見 `TESTING.md`，檢查用 `npm run check:spec-versions -w @sandlada/styles`（不接入 `test`）。

---

## 5. 構建、提交與避坑

- 指令（根目錄執行，順序先 `styles` 後 `mdc`）：`npm run build` / `npm run build:dts` / `npm test`；細節見 `package.json` 與 `CONTRIBUTING.md`。
- 入口：`mdc/all`（全量自動註冊）、`definitions`（手動註冊）、`utils`、`mdc/*` 子路徑；`styles/rolldown` 的 `mdcStyles()` 僅 Node，排 CSS 壓縮插件之前，禁瀏覽器 / `lit` 層引用。
- 提交 / 分支：`{type}: {message}`（`feat | chore | docs | refactor | fix | ai | test | extension`，可加範圍如 `feat(button)`）；分支 `type/name`。
- 避坑：
  1. 動畫用即時 Chrome CDP + 真實延時驗證；headless `--virtual-time-budget` 會凍結 `@layer` 陰影樹動畫。
  2. 共用狀態 class（如 `.indeterminate`）須以 variant 限縮（如 `:host([variant='circular']) .indeterminate`）。
  3. `css` 模板註解內禁反引號。
  4. Slider 垂直標準模式（下至上遞增）視 `isVisualReversed` 為倒序，原生 input 設 `dir="rtl"`。
