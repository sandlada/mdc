/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const ScaffoldDefinition = createStyleDefinition({
    // Container colors
    'enabled-container-color'        : Color.Surface,
    'enabled-content-color'          : Color.OnSurface,

    // Spacings & Margins
    'enabled-fab-margin-inline-start'       : `16px`,
    'enabled-fab-margin-inline-end'         : `16px`,
    'enabled-fab-margin-block-start'        : `16px`,
    'enabled-fab-margin-block-end'          : `16px`,
    'enabled-fab-lifted-margin-inline-start': `16px`,
    'enabled-fab-lifted-margin-inline-end'  : `16px`,
    'enabled-fab-lifted-margin-block-start' : `16px`,
    'enabled-fab-lifted-margin-block-end'   : `80px`,

    // Z-Indices
    'enabled-z-index-rail'           : `100`,
    'enabled-z-index-drawer'         : `200`,
    'enabled-z-index-appbar'         : `100`,
    'enabled-z-index-bottom-bar'     : `100`,
    'enabled-z-index-bottom-sheet'   : `300`,
    'enabled-z-index-fab'            : `400`,
    'enabled-z-index-snackbar-host'  : `500`,
})
