/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseShape } from './internal/base-shape'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-shape': MDCShape
    }
}

/**
 * Material Design 3 Expressive Shape (`<mdc-shape>`).
 *
 * Faithful TypeScript / Web Components port of Android `androidx.graphics.shapes`
 * and Jetpack Compose `MaterialShapes` + `MotionScheme`. Supports all 35 Material 3
 * Expressive shapes, parametric `RoundedPolygon` builders (`polygon`, `star`,
 * `rectangle`, `pill-star`), arbitrary custom polygons/vertices, content clipping,
 * interactive state-driven spring morphing (`hover-shape`, `focus-shape`,
 * `pressed-shape`, `selected-shape`, `disabled-shape`), controlled scrub morphing
 * (`morph-to` + `progress`), and autoplay sequences.
 *
 * @element mdc-shape
 * @slot - Optional content (images, icons, text) clipped to the live shape outline.
 *
 * @fires shape-morph-start - Dispatched when a spring morph transition starts.
 * @fires shape-morph-end - Dispatched when a spring morph transition settles.
 * @fires shape-change - Dispatched when `toggle` changes `selected`.
 *
 * @version
 * Material Design 3 - Expressive
 */
@customElement('mdc-shape')
export class MDCShape extends BaseShape {}
