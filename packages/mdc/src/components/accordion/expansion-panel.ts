/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseExpansionPanel } from './internal/base-expansion-panel'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-expansion-panel': MDCExpansionPanel
    }
}

/**
 * Material Design 3 Expansion Panel (`<mdc-expansion-panel>`).
 *
 * Can be used standalone or grouped inside `<mdc-accordion>`. Features a
 * header with optional leading icon, headline, supporting summary text,
 * trailing metadata, and animated expand/collapse indicator, plus a
 * collapsible body region and optional footer actions bar.
 *
 * @element mdc-expansion-panel
 * @slot - Collapsible panel body content.
 * @slot icon - Optional leading header icon (overrides `icon` attribute).
 * @slot headline - Optional header title (overrides `headline` attribute).
 * @slot supporting-text - Optional header summary text (overrides `supporting-text` attribute).
 * @slot trailing - Optional trailing metadata or controls before the expand indicator.
 * @slot expand-icon - Optional custom expand/collapse indicator icon.
 * @slot actions - Optional footer action bar rendered below the body with a top divider.
 *
 * @fires expansion-panel-toggle - Cancelable event dispatched before toggling via user click.
 * @fires expansion-panel-expanding - Dispatched when the panel starts expanding.
 * @fires expansion-panel-expanded - Dispatched when the panel finishes expanding.
 * @fires expansion-panel-collapsing - Dispatched when the panel starts collapsing.
 * @fires expansion-panel-collapsed - Dispatched when the panel finishes collapsing.
 *
 * @version
 * Material Design 3
 */
@customElement('mdc-expansion-panel')
export class MDCExpansionPanel extends BaseExpansionPanel {}
