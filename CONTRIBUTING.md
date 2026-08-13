# 貢獻指南

歡迎來到 `@sandlada/mdc`！這是一套遵循 Material Design 3 規範、以 [Lit](https://lit.dev/) 與 Web Components 實作的跨框架 UI 元件函式庫。歡迎任何形式的貢獻——回報問題、提交修補、新增元件、改善文件皆可。

---

## 專案結構

本倉庫採用 npm workspaces 管理 monorepo，所有套件位於 `packages/`：

| 資料夾 | 套件名稱 | 用途 |
| --- | --- | --- |
| `packages/mdc` | `@sandlada/mdc` | **正式發佈的函式庫套件**，消費者透過 `npm i @sandlada/mdc` 取得。內含全部元件原始碼、建構設定與對外入口。 |
| `packages/dev-app` | `@sandlada/mdc-dev` | **本地開發 playground**，基於 Vite 提供元件展示、即時熱重載與 demo 預覽，僅供開發使用、不會發佈至 npm。 |

---

## 安裝

於倉庫根目錄執行：

```bash
npm install
```

npm 會自動解析所有 workspace 的相依套件，無需逐一套件安裝。

---

## npm 指令

所有指令皆於**倉庫根目錄**執行：

| 用途 | 指令 |
| --- | --- |
| 啟動 dev-app 開發伺服器（熱重載） | `npm run dev` |
| 構建 dev-app | `npm run build:dev` |
| 預覽 dev-app 構建結果 | `npm run preview:dev` |
| 構建 `@sandlada/mdc` 套件（輸出至 `packages/mdc/build/`） | `npm run build` |
| 產出 `@sandlada/mdc` 的 `.d.ts` 型別宣告 | `npm run build:dts` |

---

## 啟動 dev-app

本地開發元件時的典型流程：

```bash
git clone https://github.com/sandlada/mdc.git
cd mdc
npm install
npm run dev
```

dev-app 啟動後可用於：瀏覽所有元件、即時預覽修改效果、查看各元件的 demo 用法。

---

## 構建 `@sandlada/mdc`

發佈前於倉庫根目錄執行：

```bash
npm run build
npm run build:dts
```

- `npm run build`：透過 [rolldown](https://rolldown.rs/) 打包，產出 ESM 模組至 `packages/mdc/build/`
- `npm run build:dts`：透過 `tsc` 產出型別宣告檔至 `packages/mdc/build/`

---

## 授權

本專案以 [MIT License](https://opensource.org/licenses/MIT) 授權，Copyright © 2024 Kai-Orion & Sandlada。詳見根目錄 `LICENSE` 檔。

提交貢獻即表示同意以 MIT License 授權你的程式碼。