/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseButtonGroup } from './internal/base-button-group'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-button-group': MDCButtonGroup
    }
}

/**
 * `<mdc-button-group>` arranges buttons into a cohesive horizontal or vertical group.
 *
 * Supports two variants:
 * - `connected` (default): Buttons are visually docked side-by-side with 2px gap,
 *   cohesive outer corner radii, and expressive inner corner shape-morphing.
 * - `standard`: Buttons are grouped with standard 8px gap and independent corner shapes.
 *
 * Supports three selection models via `selection-mode`:
 * - `none` (default): Action grouping without selection enforcement.
 * - `single`: Radio semantics (mutual exclusion).
 * - `multiple`: Checkbox semantics (multi-selection).
 *
 * @version
 * Material Design 3 Expressive
 *
 * @link
 * https://m3.material.io/components/button-groups/overview
 * https://m3.material.io/components/button-groups/specs
 */
@customElement('mdc-button-group')
export class MDCButtonGroup extends BaseButtonGroup {}
