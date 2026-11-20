/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseBreadcrumbs } from './internal/base-breadcrumbs'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-breadcrumbs': MDCBreadcrumbs
    }
}

/**
 * Material Design 3 Breadcrumbs (`<mdc-breadcrumbs>`).
 *
 * Displays hierarchical navigation trails with support for:
 * - Slotted `<mdc-breadcrumb-item>` elements or programmatic `items` data
 * - Visual variants (`standard`, `tonal`, `outlined`), sizes (`small`, `medium`, `large`), and shapes (`round`, `square`)
 * - Automatic path collapsing (`max-items`) with overflow `<mdc-menu>` or inline expansion
 * - Customizable separators (`chevron`, `slash`, `arrow`, custom string, or `separator` slot)
 *
 * @element mdc-breadcrumbs
 * @slot - `<mdc-breadcrumb-item>` children representing the path.
 * @slot separator - Custom separator element rendered between items.
 * @fires breadcrumb-select - Cancelable event dispatched when a non-current item is activated.
 * @fires breadcrumbs-expand - Dispatched when a collapsed trail is expanded inline.
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-breadcrumbs')
export class MDCBreadcrumbs extends BaseBreadcrumbs {}
