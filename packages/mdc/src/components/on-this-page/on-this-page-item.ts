/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-on-this-page-item` element — an in-page navigation link item.
 */
import { customElement } from 'lit/decorators.js'
import { BaseOnThisPageItem } from './internal/base-on-this-page-item'
import { OnThisPageItemStyles } from './on-this-page-item.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-on-this-page-item': OnThisPageItem
    }
}

/**
 * @element mdc-on-this-page-item
 *
 * An individual in-page navigation link item within `mdc-on-this-page`.
 *
 * @csspart label - The label text container.
 */
@customElement('mdc-on-this-page-item')
export class OnThisPageItem extends BaseOnThisPageItem {
    static override styles = OnThisPageItemStyles
}
