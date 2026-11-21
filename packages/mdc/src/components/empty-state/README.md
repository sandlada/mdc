# Empty State

`mdc-empty-state` presents a centered message inside an empty screen or section. The visual order follows the [Android intent resolver](https://android.googlesource.com/platform/frameworks/base/+/82425166a89a2ba15d1af8de4eddb62cbe56009e/core/res/res/layout/resolver_empty_states.xml). A heading alone works for a simple empty list, as in [AndroidX ListFragment](https://developer.android.com/reference/androidx/fragment/app/ListFragment#setEmptyText(java.lang.CharSequence)). Named slots let applications supply their own content, following the [Compose slot API pattern](https://developer.android.com/develop/ui/compose/layouts/basics#slot-based-layouts).

```js
import '@sandlada/mdc/components/empty-state/index'
import '@sandlada/mdc/components/icon/index'
import '@sandlada/mdc/components/button/index'
```

```html
<mdc-empty-state>
    <mdc-icon slot="illustration" name="search_off" aria-hidden="true"></mdc-icon>
    <h2 slot="headline">No matching results</h2>
    <p slot="supporting-text">Try another search or clear your filters.</p>
    <mdc-button slot="actions" variant="filled">Clear filters</mdc-button>
</mdc-empty-state>
```

| Slot | Content |
| --- | --- |
| `illustration` | Optional image or icon. Use `alt=""` on a decorative image or `aria-hidden="true"` on a decorative icon. |
| `headline` | Use the heading level that fits the surrounding page. |
| `supporting-text` | Optional explanation or next step. |
| `actions` | Optional buttons or links. Multiple actions wrap as space narrows. |

Place each slotted element directly inside `mdc-empty-state`. The application controls visibility with the native `hidden` attribute or conditional rendering and handles actions through the controls' normal events.

Override `--mdc-empty-state-enabled-headline-color`, `--mdc-empty-state-enabled-supporting-text-color`, or `--mdc-empty-state-enabled-illustration-color` to theme the content. `--mdc-empty-state-container-max-inline-size` controls the maximum content width.
