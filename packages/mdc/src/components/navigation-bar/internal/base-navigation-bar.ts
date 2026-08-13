/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Internal base for `mdc-navigation-bar` that adds scope propagation via
 * {@link BaseNavigationContainer} and the connection-promise mixin.
 *
 * The show/close / scroll-driven auto-hide logic has been extracted into the
 * standalone {@link EdgeSlideController} at
 * `src/utils/controller/edge-slide-controller.ts`.
 */
import { BaseNavigationContainer } from '../../navigation/internal/base-navigation-container'
import { mixinConnectedPromiseResolve } from '../../../utils/behaviors/connected-promise-resolve'
import { composeMixin } from '../../../utils/compose-mixin/compose-mixin'

/**
 * Base navigation bar with scope propagation and connection-promise support.
 *
 * Composed with {@link mixinConnectedPromiseResolve} so `isConnectedPromise`
 * is available (resolved on `connectedCallback`, re-created on disconnect).
 *
 * Show/close and scroll-driven auto-hide are handled by
 * {@link EdgeSlideController} — add one in the public component class to
 * enable those features.
 */
export const BaseNavigationBar = composeMixin(mixinConnectedPromiseResolve)(
    BaseNavigationContainer,
)
