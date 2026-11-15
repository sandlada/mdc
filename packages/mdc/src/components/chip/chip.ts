/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseChip } from './internal/base-chip'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-chip': MDCChip
    }
}

/**
 * @element mdc-chip
 *
 * A Material Design 3 chip component supporting 4 variants (`assist`, `filter`,
 * `input`, `suggestion`), flat & elevated surfaces, leading icons / avatars,
 * animated filter checkmarks, trailing icons, interactive input close actions,
 * and WCAG 2.2+ focus/contrast/reduced-motion accessibility.
 *
 * @slot - The chip label text (falls back to `label` property when empty).
 * @slot icon - Leading 18dp icon (`assist`, `filter`, `input`, `suggestion`).
 * @slot avatar - 24dp circular avatar (`input` variant).
 * @slot trailing-icon - Trailing 18dp icon (`filter` dropdown or custom `input` close icon).
 * @slot selected-icon - Custom selected indicator replacing default checkmark (`filter` variant).
 *
 * @fires chip-toggle - Dispatched when selection toggles (`filter` / `input`).
 * @fires chip-navigate - Dispatched when activated (`assist` / `suggestion`).
 * @fires chip-close - Dispatched when close button or Delete/Backspace removes (`input`).
 * @fires update-focus - Dispatched when focusability changes (bubbles).
 *
 * @version
 * Material Design 3
 *
 * @link
 * https://m3.material.io/components/chips/overview
 */
@customElement('mdc-chip')
export class MDCChip extends BaseChip {}
