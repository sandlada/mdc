# MDC Tokens 系統設計與開發指南

> **模組路徑**：`@sandlada/mdc/src/utils/tokens`
> **核心目標**：提供基於 MD3 / MD3 Expressive 規範的型別安全 Token 定義、子組件轉發橋接與響應式狀態樣式表編譯管線。

---

## 核心管線總覽

MDC 的樣式與 Token 體系由 **「定義期 $\to$ 注入期 $\to$ 樣式期」** 三階段組成：

```plaintext
┌─────────────────────────────────────────┐
│ 1. 定義期 (Definition Stage) - createStyleDefinition + forwardTokens             │
│    在 *.definition.ts 中宣告 5 狀態元組，並透過 forwardTokens 宣告子組件覆蓋     │
├─────────────────────────────────────────┤
│ 2. 注入期 (Token Injection Stage) - defineComponentTokenRefs                     │
│    在 *.style.ts 中單行自動將私有變數 (--_) 與子組件公有變數 (--mdc-*) 注入 :host│
├─────────────────────────────────────────┤
│ 3. 樣式期 (Stylesheet Stage) - createStyleSheet                                  │
│    在 *.style.ts 中使用 @anchor / @when 編寫樣式，編譯器自動差分展開互動狀態     │
└─────────────────────────────────────────┘
```

---

## 一、 Tokens 的核心用法

### 1. 創建 Definition（`createStyleDefinition`）

`createStyleDefinition` 是 Design Token 的單一事實來源（SSOT）。每個屬性可以傳入一個 **5 狀態陣列** `[enabled, hovered, pressed, focused, disabled]` 或**單一靜態值**：

```typescript
import { Color, Space } from '@sandlada/mdk'
import { createStyleDefinition } from '@sandlada/mdc/utils'

export const ButtonDefinition = createStyleDefinition({
    // 5 狀態屬性：自動展開為 enabled-, hovered-, pressed-, focused-, disabled-
    'container-color': [
        Color.Primary         ,// 0: enabled
        Color.Primary         ,// 1: hovered
        Color.Primary         ,// 2: pressed
        Color.Primary         ,// 3: focused
        Color.OnSurfaceVariant,// 4: disabled
    ],

    // 單一值屬性：保持靜態
    'container-height'           : '40px',
})
```

---

### 2. 子組件 Token 轉發（`forwardTokens`）

當父組件（如 `Button`）內部包含子 Web Component（如 `Icon`、`Ripple`、`FocusRing`）時，在定義期使用 `forwardTokens` 宣告子組件的覆蓋變數與回退值：

```typescript
import { createStyleDefinition, forwardTokens } from '@sandlada/mdc/utils'
import { IconDefinition } from '../icon/icon.definition'
import { RippleDefinition } from '../ripple/ripple.definition'

export const ButtonDefinition = createStyleDefinition({
    // 父組件自身 Token
    'container-color': [Color.Primary, Color.Hover, Color.Active, Color.Focus, Color.Disabled],

    // 轉發 Icon Token：自動綁定到 --mdc-icon-*
    ...forwardTokens(IconDefinition, {
        targetPrefix: '--mdc-icon',
        name: 'icon', // 映射至父組件 --mdc-button-icon-*
        tokens: {
            'color': [Color.OnPrimary, Color.OnHover, Color.OnActive, Color.OnFocus, Color.Disabled],
            'size': '18px',
        },
    }),

    // 轉發 Ripple Token：自動綁定到 --mdc-ripple-*
    ...forwardTokens(RippleDefinition, {
        targetPrefix: '--mdc-ripple',
        name: 'ripple',
        tokens: {
            'hovered-color': Color.OnPrimary,
            'hovered-opacity': '0.08',
        },
    }),
})
```

---

### 3. 一體化 Host 變數注入（`defineComponentTokenRefs`）

在組件的 `.style.ts` 中，使用 `defineComponentTokenRefs` 一行完成所有 CSS 自訂屬性在 `:host` 的宣告：

```typescript
import { css } from 'lit'
import { defineComponentTokenRefs, createStyleSheet } from '@sandlada/mdc/utils'
import { ButtonDefinition } from './button.definition'

// 自動分類生成：
// 1. 父組件內部私有變數: --_enabled-container-color: var(--mdc-button-enabled-container-color, #primary);
// 2. 子組件公有橋接變數: --mdc-icon-enabled-color: var(--mdc-button-enabled-icon-color, #on-primary);
const tokens = defineComponentTokenRefs(ButtonDefinition, { prefix: '--mdc-button' })

export const ButtonStyles = [
    css`:host { ${tokens} }`,
    createStyleSheet(ButtonDefinition, () => css`
        /* ... */
    `),
]
```

---

### 4. 狀態樣式表編譯（`createStyleSheet`）

`createStyleSheet` 提供了類似 Sass 但面向現代 CSS 的響應式狀態編譯器。透過 `@anchor` 指令標記互動根節點，編譯器會自動分析 CSS 中消費的 `var(--_*)` 變數所包含的 5 種狀態，自動產出最小差分選擇器規則（`:hover`、`:focus-within`、`:active`、`[disabled]`）：

```typescript
export const ButtonStyles = [
    css`:host { ${tokens} }`,
    createStyleSheet(ButtonDefinition, () => css`
        :host {
            display: inline-flex;
            outline: none;
        }

        @anchor .container {
            display: flex;
            align-items: center;
            height: var(--_container-height);
            background-color: var(--_container-color); /* 自動展開 hover, active, focus, disabled 差分樣式 */
            border-radius: var(--_container-shape-start-start);

            .label {
                color: var(--_label-color);
            }
        }

        @when(:host([selected])) {
            @anchor .container {
                background-color: var(--_selected-container-color);
            }
        }
    `),
]
```

---

## 二、 已棄用 / 不再使用的 APIs（Deprecated APIs）

隨著 Token 體系升級為「Definition 轉發 + 狀態編譯管線」，以下舊版 API 已被取代或廢棄，**在新開發中嚴禁使用**：

| 已廢棄 API                             | 來源檔案                       | 廢棄原因                                                                      | 推薦替代方案                                                                  |
| :------------------------------------- | :----------------------------- | :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **`overrideComponentTokens`**          | `override-component-tokens.ts` | 舊版 JSS 物件注入覆蓋方式，缺乏狀態聯動與型別校驗，破壞單一事實來源（SSOT）。 | 改用 **`forwardTokens`**（在 Definition 中轉發）或 **`overrideStyleSheet`**。 |
| **`stringTokens`**                     | `string-tokens.ts`             | 舊版簡單字串拼接 Token 方案，無法處理多狀態與繼承鏈。                         | 改用 **`defineComponentTokenRefs`** 一體化注入。                              |
| **手寫 `:host` Token Fallback 字符串** | 手動拼接                       | 容易引發數值漂移與語法錯誤。                                                  | 改用 **`createStyleDefinition`** + **`defineComponentTokenRefs`**。           |

---

## 三、 常見場景快速指引

### Q1: 如何覆蓋子組件（例如 Button 內部的 Icon 顏色）？
- **若子組件僅有單一狀態（如 Icon 只有 enabled-color）**：
  1. 在 `ButtonDefinition` 中透過 `...forwardTokens(IconDefinition, { tokens: { color: [c1, c2, c3, c4, c5] } })` 宣告 5 種狀態的色值。
  2. `defineComponentTokenRefs` 會在 `:host` 注入公有變數 `--mdc-icon-enabled-color: var(--mdc-button-enabled-icon-color, c1);`，以及父組件私有變數 `--_enabled-icon-color`, `--_hovered-icon-color`, ...（自動過濾掉無效的 `--mdc-icon-hovered-color`）。
  3. 在 `ButtonStyles` 中配合 `createStyleSheet` 於 `@anchor .container` 內部綁定：
     ```css
     @anchor .container {
         mdc-icon {
             --mdc-icon-enabled-color: var(--_icon-color);
         }
     }
     ```
     編譯器會自動在 `.container:hover mdc-icon` 下切換 `--mdc-icon-enabled-color: var(--_hovered-icon-color);`，實現精準狀態響應。

- **若子組件自身具備多狀態（如 Ripple 定義了 hovered/pressed）**：
  `defineComponentTokenRefs` 會自動在 `:host` 注入 `--mdc-ripple-hovered-color` 與 `--mdc-ripple-pressed-color`，子組件內部自動監聽生效。

### Q2: 如何針對單一主題或情境覆蓋組件 Token？
- **使用 `overrideStyleSheet`**：
  ```typescript
  export const DarkThemeStyles = css`
      :host {
          ${overrideStyleSheet(ButtonDefinition, '--mdc-button', {
              'container-color': '#000000',
          })}
      }
  `
  ```
