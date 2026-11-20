/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { customElement } from 'lit/decorators.js'
import { BasePullToRefresh } from './internal/base-pull-to-refresh'

declare global {
    interface HTMLElementTagNameMap {
        'mdc-pull-to-refresh': MDCPullToRefresh
    }
}

/**
 * Material Design 3 Expressive Pull to Refresh (`<mdc-pull-to-refresh>`).
 *
 * Modeled after Android Jetpack Compose `PullToRefreshBox` and Flutter `RefreshIndicator`:
 * - Supports both MD3 Expressive `<mdc-loading-indicator contained>` (`indicator="expressive"`)
 *   and classic MD3/Flutter circular `<mdc-progress-indicator>` (`indicator="circular"`)
 * - Physics-damped pull resistance (`applyPullResistance`) with configurable `threshold` (80px default)
 * - Overlay (`mode="overlay"`) or push (`mode="push"`) content layout
 * - Touch, pen, and optional mouse pointer drag support with horizontal swipe guard
 *
 * @element mdc-pull-to-refresh
 * @slot - Scrollable content wrapped by the pull-to-refresh container.
 * @slot indicator - Optional custom indicator element overriding the built-in indicator.
 * @fires refresh - Dispatched when a pull gesture is released past `threshold` or `triggerRefresh()` is called.
 * @fires pull-state-change - Dispatched when `pullState` transitions between `idle`, `pulling`, `ready`, and `refreshing`.
 * @fires pull-progress - Dispatched as `pullDistance` / `progress` updates during a gesture.
 *
 * @version
 * Material Design 3 - Expressive
 */
@customElement('mdc-pull-to-refresh')
export class MDCPullToRefresh extends BasePullToRefresh {}
