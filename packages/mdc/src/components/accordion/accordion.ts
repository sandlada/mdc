/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseAccordion } from './internal/base-accordion'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-accordion': MDCAccordion
    }
}

/**
 * Material Design 3 Accordion (`<mdc-accordion>`).
 *
 * Groups `<mdc-expansion-panel>` elements with Android / AndroidX-inspired
 * single- or multi-expand coordination, keyboard arrow navigation, and
 * connected or separated card layouts.
 *
 * @element mdc-accordion
 * @slot - `<mdc-expansion-panel>` children.
 * @fires accordion-change - Dispatched when the set of expanded panels changes.
 *
 * @cssproperty --mdc-accordion-small-panel-gap
 * @cssproperty --mdc-accordion-medium-panel-gap
 * @cssproperty --mdc-accordion-large-panel-gap
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-accordion')
export class MDCAccordion extends BaseAccordion {}
