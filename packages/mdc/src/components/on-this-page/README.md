# On This Page (`<mdc-on-this-page>`, `<mdc-on-this-page-item>`)

Material Design 3 `on-this-page` component (`mdc-on-this-page`, `mdc-on-this-page-item`).

## Usage

```html
<mdc-on-this-page></mdc-on-this-page>
```

## Properties

| Property | Type | Default |
| --- | --- | --- |
| `href` | `string` | `''` |
| `target` | `string` | `''` |
| `label` | `string` | `''` |
| `active` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `level` | `number` | `1` |
| `index` | `number` | `0` |
| `caption` | `string` | `'On this page'` |
| `headline` | `string` | `''` |
| `activeHref` | `string` | `''` |
| `activeIndex` | `number` | `0` |
| `scrollTarget` | `string \| HTMLElement \| Window` | `'window'` |
| `scrollOffset` | `number` | `96` |
| `updateHash` | `boolean` | `true` |
| `contentSelector` | `string` | `''` |
| `autoDiscover` | `boolean` | `false` |
| `indicatorFit` | `OnThisPageIndicatorFit` | `'content'` |

## Events

- `mdc-on-this-page-item-click`

## Slots

- `caption`
- `default`
- `headline`
