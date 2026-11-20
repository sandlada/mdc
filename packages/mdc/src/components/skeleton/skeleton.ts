/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BaseSkeleton } from './internal/base-skeleton'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-skeleton': MDCSkeleton
    }
}

/**
 * Material Design 3 Skeleton & Shimmer (`<mdc-skeleton>`).
 *
 * Renders low-cognitive-load loading placeholders in 5 geometric variants
 * (`text`, `rectangular`, `rounded`, `circular`, `pill`) with GPU-composited
 * `shimmer`, `pulse`, or static (`none`) appearance. Supports both standalone
 * placeholder usage (including multi-line text) and zero-CLS content-wrapper
 * mode via the default `<slot>` + `loading` attribute.
 *
 * @element mdc-skeleton
 * @slot - Optional content wrapped in zero-CLS loading mode.
 *
 * @fires skeleton-loaded - Dispatched when `isLoading` transitions from `true` to `false`.
 *
 * @version
 * Material Design 3 - Expressive
 */
@customElement('mdc-skeleton')
export class MDCSkeleton extends BaseSkeleton {}
