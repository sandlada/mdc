/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-tab` element — a single tab cell inside `mdc-tabs`.
 */
import { customElement } from 'lit/decorators.js'
import { BaseTab } from './internal/base-tab'
import { TabStyles } from './tab.style'

/**
 * @element mdc-tab
 *
 * A tab cell. Selection state is owned by the parent `mdc-tabs` bar; render a
 * tab on its own only for standalone / demo purposes.
 *
 * @slot icon — Optional leading icon.
 * @slot — The tab label text.
 *
 * @cssproperty --mdc-tab-container-height
 * @cssproperty --mdc-tab-active-indicator-color
 * ...
 */
@customElement('mdc-tab')
export class Tab extends BaseTab {
    static override styles = TabStyles
}
