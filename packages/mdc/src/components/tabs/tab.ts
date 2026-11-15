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

declare global {
    interface HTMLElementTagNameMap {
        'mdc-tab': Tab
    }
}

/**
 * @element mdc-tab
 *
 * A tab cell. Selection state is owned by the parent `mdc-tabs` bar; render a
 * tab on its own only for standalone / demo purposes.
 *
 * @slot icon — Optional leading / stacked icon.
 * @slot badge — Optional badge (anchored to icon when present, or inline after label).
 * @slot — The tab label text.
 *
 * @csspart tab — The inner tab container.
 * @csspart indicator — The active indicator element.
 *
 * @cssproperty --mdc-tab-container-height
 * @cssproperty --mdc-tab-with-icon-and-label-text-container-height
 * @cssproperty --mdc-tab-enabled-active-indicator-color
 * @cssproperty --mdc-tab-active-indicator-height
 */
@customElement('mdc-tab')
export class Tab extends BaseTab {
    static override styles = TabStyles
}
