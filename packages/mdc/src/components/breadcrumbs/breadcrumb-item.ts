/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseBreadcrumbItem } from './internal/base-breadcrumb-item'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-breadcrumb-item': MDCBreadcrumbItem
    }
}

/**
 * Material Design 3 Breadcrumb Item (`<mdc-breadcrumb-item>`).
 *
 * @element mdc-breadcrumb-item
 * @slot - Label text for this breadcrumb node.
 * @slot icon - Optional leading icon slot (overrides `icon` attribute).
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-breadcrumb-item')
export class MDCBreadcrumbItem extends BaseBreadcrumbItem {}
