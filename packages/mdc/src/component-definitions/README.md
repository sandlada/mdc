# Component Definitions

```ts
/**
 * 樣板代碼
 *
 * @fileoverview
 * 假設組件 Chrome :
 * - variant: 'm2' | 'm3'
 * - platform: 'linux' | 'windows'
 * - size: 'medium' |＇large'
 * - disabled: boolean
 * 且組件存在hovered，pressed，focused狀態。
 */
const ChromeDefinition = createStyleDefinition({
    /**
     * @rule
     * 因爲存在4+1種狀態，所以默認狀態用enabled-*表示
     */
    'enabled-*' : `value`, // 默認，開啓狀態
    'hovered-*' : `value`, // 懸浮狀態
    'pressed-*' : `value`, // 點擊狀態
    'focused-*' : `value`, // 聚焦狀態
    'disabled-*': `value`, // 禁用狀態

    /**
     * @rule
     * 因爲存在 medium 和 large 兩種尺寸，所以我們采用 2 種狀態 medium-* 和 large-* 表示
     * 與4+1種狀態相乘得到10種字段
     */
    'enabled-medium-container-height' : `value`,
    'enabled-large-container-height'  : `value`,
    'hovered-medium-container-height' : `value`,
    'hovered-large-container-height'  : `value`,
    'pressed-medium-container-height' : `value`,
    'pressed-large-container-height'  : `value`,
    'focused-medium-container-height' : `value`,
    'focused-large-container-height'  : `value`,
    'disabled-medium-container-height': `value`,
    'disabled-large-container-height' : `value`,

    /**
     * @rule
     * 對於render内部最外層RDOM元素（不是Host），通常作爲container角色。
     * 它的屬性通常由 {container-*} 表示。
     */
    'enabled-{height|width|size|color|...}': `value`, // 錯誤：禁止單純使用某個名稱，因爲不知道這個名稱指的是哪個元素
    'enabled-container-height'         : `value`, // 正確：設置了container元素，明確指定是container的height

    /**
     * @rule
     * 我們不能單純使用一個沒有任何方向的字段表示 container 的圓角
     * 必須展開為 *-shape-{start|end}-{start|end}
     */
    'enabled-container-shape'            : `12px`, // NO
    'enabled-container-shape-start-start': `12px`, // YES
    'enabled-container-shape-start-end'  : `12px`, // YES
    'enabled-container-shape-end-start'  : `12px`, // YES
    'enabled-container-shape-end-end'    : `12px`, // YES

    /**
     * @rule
     * 對於所有的 padding 屬性和 margin 屬性，必須使用 {padding|margin}-{inline|block}-{start|end} 格式。
     * 即使 4 個方向數值均相等，也必須拆分為 4 個獨立欄位，禁止使用 padding-block 或 padding-inline 縮寫，必須搭配 start 與 end。
     */
    'enabled-container-padding-inline-start': `4px`, // = padding-inline-start: 4px
    'enabled-container-padding-inline-end'  : `4px`, // = padding-inline-end: 4px
    'enabled-container-padding-block-start' : `4px`, // = padding-block-start: 4px
    'enabled-container-padding-block-end'   : `4px`, // = padding-block-end: 4px
    'enabled-container-margin-inline-start' : `4px`, // = margin-inline-start: 4px
    'enabled-container-margin-inline-end'   : `4px`, // = margin-inline-end: 4px
    'enabled-container-margin-block-start'  : `4px`, // = margin-block-start: 4px
    'enabled-container-margin-block-end'    : `4px`, // = margin-block-end: 4px

    /**
     * @rule
     * 對於 label 等元素的字體設置必須完整包含：
     * - font (font-family)
     * - font-size
     * - line-height
     * - font-weight
     * - tracking (letter-space)
     *
     * 考慮到組件存在 disabled 狀態，所以在 disabled 的狀態下文字需要半透明：
     * - opacity
     */
    'enabled-medium-label-font'       : `value`,
    'enabled-medium-label-line-height': `value`,
    'enabled-medium-label-size'       : `value`,
    'enabled-medium-label-tracking'   : `value`,
    'enabled-medium-label-weight'     : `value`,
    'enabled-medium-label-opacity'    : `value`,
    // 此處省略 hovered, pressed, focused 和 large
    'disabled-medium-label-font'       : `value`,
    'disabled-medium-label-line-height': `value`,
    'disabled-medium-label-size'       : `value`,
    'disabled-medium-label-tracking'   : `value`,
    'disabled-medium-label-weight'     : `value`,
    'disabled-medium-label-opacity'    : `value`,

})

/**
 * 假設組件存在：
 * - disabled: boolean
 * - selected: boolean
 * 且組件存在hovered，pressed，focused狀態。
 */
const Chrome2Definition = createStyleDefinition({
    /**
     * @rule
     * 對於 checked， selected 這樣的狀態，放置在字段名稱最末尾
     */
    'enabled-container-height'         : `value`,
    'enabled-container-height-selected': `value`,
    'enabled-medium-label-font'         : `value`,
    'enabled-medium-label-font-selected': `value`,

})
```
