/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-tabs` element — a Material 3 (Expressive) tab bar.
 */
import { customElement } from 'lit/decorators.js'
import { BaseTabs } from './internal/base-tabs'
import { TabsStyles } from './tabs.style'

/**
 * @element mdc-tabs
 *
 * A tab bar that manages single selection across its `mdc-tab` children and
 * animates the active indicator between them.
 *
 * @slot — One or more `mdc-tab` elements.
 *
 * @fires change — Cancelable. Fires before selection commits; `preventDefault()`
 *     reverts the selection.
 *
 * @cssproperty --mdc-tabs-divider-color
 * @cssproperty --mdc-tabs-divider-height
 */
@customElement('mdc-tabs')
export class Tabs extends BaseTabs {
    static override styles = TabsStyles
}
