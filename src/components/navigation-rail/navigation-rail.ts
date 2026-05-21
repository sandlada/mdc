/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Navigation rail container.
 *
 * @example
 * ```html
 * <mdc-navigation-rail navigation-scope="main-nav">
 *   <mdc-navigation-tab name="rail-tabs" value="/home">Home</mdc-navigation-tab>
 *   <mdc-navigation-tab name="rail-tabs" value="/settings">Settings</mdc-navigation-tab>
 * </mdc-navigation-rail>
 * ```
 */
import { customElement } from 'lit/decorators.js'
import { BaseNavigationContainer } from '../navigation/internal/base-navigation-container'

@customElement('mdc-navigation-rail')
export class NavigationRail extends BaseNavigationContainer {}
