/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Public `mdc-on-this-page` element — an in-page table of contents / anchor navigation component.
 */
import { customElement } from 'lit/decorators.js'
import { BaseOnThisPage } from './internal/base-on-this-page'
import { OnThisPageStyles } from './on-this-page.style'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-on-this-page': OnThisPage
    }
}

/**
 * @element mdc-on-this-page
 *
 * An in-page table of contents / outline navigation that tracks scroll position,
 * highlights active sections, and animates a pill outline indicator.
 *
 * @slot caption - Custom caption text/element above the title (defaults to "On this page").
 * @slot headline - Custom headline/title text/element.
 * @slot - One or more `mdc-on-this-page-item` elements.
 *
 * @fires change - Fires when the active item changes.
 *
 * @csspart caption - The caption text element.
 * @csspart headline - The headline title element.
 * @csspart indicator - The animated outline pill indicator.
 */
@customElement('mdc-on-this-page')
export class OnThisPage extends BaseOnThisPage {
    static override styles = OnThisPageStyles
}
