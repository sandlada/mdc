/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @link
 * https://developer.android.com/reference/kotlin/androidx/compose/material3/Scaffold
 * https://m3.material.io/foundations/layout/understanding-layout/
 */
import { Color } from '../../utils/color'
import { createStyleDefinition } from '../../utils/style'

/**
 * Style definition for `mdc-scaffold`.
 *
 * Aligns with Android Jetpack Compose Material3 `Scaffold` /
 * `ScaffoldDefaults` + `NavigationSuiteScaffold` window size classes:
 * - Container defaults to `background` (`ScaffoldDefaults.containerColor =
 *   MaterialTheme.colorScheme.background`), content to `on-background`.
 * - FAB offset `FabSpacing = 16.dp` on every side; FAB sits above the
 *   bottom bar, or overlays it for `end-overlay` (`FabPosition.EndOverlay`).
 * - Z order follows visual safety & placement:
 *   body (0) < rail/appbar (100) < bottom-bar (200) < drawer (300) <
 *   FAB (400) < snackbar-host (500) < bottom-sheet (600).
 */
export const ScaffoldDefinition = createStyleDefinition({
    // Container colors (Android `containerColor` / `contentColor`).
    'enabled-container-color': Color.Background,
    'enabled-content-color'  : Color.OnBackground,

    // Spacings & Margins (Android `FabSpacing = 16.dp`).
    'enabled-fab-spacing'            : `16px`,
    'enabled-snackbar-spacing'       : `16px`,
    'enabled-fab-margin-inline-start': `16px`,
    'enabled-fab-margin-inline-end'  : `16px`,
    'enabled-fab-margin-block-start' : `16px`,
    'enabled-fab-margin-block-end'   : `16px`,

    // Z-Indices (body < rail/appbar < bottom-bar < drawer < fab < snackbar-host < bottom-sheet).
    'enabled-z-index-rail'         : `100`,
    'enabled-z-index-appbar'       : `100`,
    'enabled-z-index-bottom-bar'   : `200`,
    'enabled-z-index-drawer'       : `300`,
    'enabled-z-index-fab'          : `400`,
    'enabled-z-index-snackbar-host': `500`,
    'enabled-z-index-bottom-sheet' : `600`,
})
