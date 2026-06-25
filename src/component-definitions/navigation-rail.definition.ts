/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * |--------------------------|
 * |                          |
 * |   IconButton             |
 * |   Fab                    |
 * |                          |
 * |   |------------------|   |
 * |   | Segments         |   |
 * |   |   Label-1        |   |
 * |   |   Label-2        |   |
 * |   |                  |   |
 * |   |   SectionHeader1 |   |
 * |   |                  |   |
 * |___|__________________|___|
 *     |   SectionHeader2 |
 *     |   Label          |
 *     |------------------|
 *
 * @version
 * Material Design 3 - Expressive
 */
import { Shape, Space }          from '@sandlada/mdk'
import { Color }                 from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

type BaseNavigationProps
     =  'scrim-color'
    | 'divider-color'

type StandardNavigationRailProps
     =  'standard-container-width'
    | 'standard-container-shape'
    | 'standard-container-color'
    | 'standard-container-item-gap'
    | 'standard-container-block-leading-space'
    | 'standard-container-block-trailing-space'
    | 'standard-container-inline-leading-space'
    | 'standard-container-inline-trailing-space'
    | 'standard-segments-item-gap'
    | 'standard-segments-block-leading-space'
    | 'standard-segments-block-trailing-space'
    | 'standard-segments-inline-leading-space'
    | 'standard-segments-inline-trailing-space'
    | 'standard-menu-and-fab-item-gap'
    | 'standard-menu-and-fab-block-leading-space'
    | 'standard-menu-and-fab-block-trailing-space'
    | 'standard-menu-and-fab-inline-leading-space'
    | 'standard-menu-and-fab-inline-trailing-space'
type ModalNavigationRailProps
     =  'modal-container-width'
    | 'modal-container-shape'
    | 'modal-container-color'
    | 'modal-container-item-gap'
    | 'modal-container-block-leading-space'
    | 'modal-container-block-trailing-space'
    | 'modal-container-inline-leading-space'
    | 'modal-container-inline-trailing-space'
    | 'modal-segments-item-gap'
    | 'modal-segments-block-leading-space'
    | 'modal-segments-block-trailing-space'
    | 'modal-segments-inline-leading-space'
    | 'modal-segments-inline-trailing-space'
    | 'modal-menu-and-fab-item-gap'
    | 'modal-menu-and-fab-block-leading-space'
    | 'modal-menu-and-fab-block-trailing-space'
    | 'modal-menu-and-fab-inline-leading-space'
    | 'modal-menu-and-fab-inline-trailing-space'

export const NavigationRailCollapsedDefinition = createStyleDefinition({
    'scrim-color'                                : Color.Scrim,
    'divider-color'                              : Color.OutlineVariant,
    'scrim-opacity'                              : `0.38`,
    'standard-container-width'                   : `96px`,
    'standard-container-shape'                   : Shape.None,
    'standard-container-color'                   : `transparent`,
    'standard-container-item-gap'                : Space.Space500,
    'standard-container-block-leading-space'     : Space.Space600,
    'standard-container-block-trailing-space'    : Space.Space700,
    'standard-container-inline-leading-space'    : Space.Space0,
    'standard-container-inline-trailing-space'   : Space.Space0,
    'standard-segments-item-gap'                 : Space.Space50,
    'standard-segments-block-leading-space'      : Space.Space0,
    'standard-segments-block-trailing-space'     : Space.Space0,
    'standard-segments-inline-leading-space'     : Space.Space0,
    'standard-segments-inline-trailing-space'    : Space.Space0,
    'standard-menu-and-fab-item-gap'             : Space.Space50,
    'standard-menu-and-fab-block-leading-space'  : Space.Space0,
    'standard-menu-and-fab-block-trailing-space' : Space.Space0,
    'standard-menu-and-fab-inline-leading-space' : Space.Space0,
    'standard-menu-and-fab-inline-trailing-space': Space.Space0,
} satisfies Record<StandardNavigationRailProps & BaseNavigationProps, any>)

export const NavigationRailExpandedDefinition = createStyleDefinition({
    'scrim-color'  : Color.Scrim,
    'divider-color': Color.OutlineVariant,
    'scrim-opacity': `0.38`,

    'standard-container-width'                   : `220px`,
    'standard-container-shape'                   : Shape.None,
    'standard-container-color'                   : `transparent`,
    'standard-container-item-gap'                : Space.Space500,
    'standard-container-block-leading-space'     : Space.Space600,
    'standard-container-block-trailing-space'    : Space.Space250,
    'standard-container-inline-leading-space'    : Space.Space250,
    'standard-container-inline-trailing-space'   : Space.Space250,
    'standard-segments-item-gap'                 : Space.Space0,
    'standard-segments-block-leading-space'      : Space.Space0,
    'standard-segments-block-trailing-space'     : Space.Space0,
    'standard-segments-inline-leading-space'     : Space.Space0,
    'standard-segments-inline-trailing-space'    : Space.Space0,
    'standard-menu-and-fab-item-gap'             : Space.Space50,
    'standard-menu-and-fab-block-leading-space'  : Space.Space0,
    'standard-menu-and-fab-block-trailing-space' : Space.Space0,
    'standard-menu-and-fab-inline-leading-space' : Space.Space0,
    'standard-menu-and-fab-inline-trailing-space': Space.Space0,

    'modal-container-width'                   : `220px`,
    'modal-container-shape'                   : Shape.Large,
    'modal-container-color'                   : Color.SurfaceContainer,
    'modal-container-item-gap'                : Space.Space500,
    'modal-container-block-leading-space'     : Space.Space600,
    'modal-container-block-trailing-space'    : Space.Space250,
    'modal-container-inline-leading-space'    : Space.Space250,
    'modal-container-inline-trailing-space'   : Space.Space250,
    'modal-segments-item-gap'                 : Space.Space0,
    'modal-segments-block-leading-space'      : Space.Space0,
    'modal-segments-block-trailing-space'     : Space.Space0,
    'modal-segments-inline-leading-space'     : Space.Space0,
    'modal-segments-inline-trailing-space'    : Space.Space0,
    'modal-menu-and-fab-item-gap'             : Space.Space50,
    'modal-menu-and-fab-block-leading-space'  : Space.Space0,
    'modal-menu-and-fab-block-trailing-space' : Space.Space0,
    'modal-menu-and-fab-inline-leading-space' : Space.Space0,
    'modal-menu-and-fab-inline-trailing-space': Space.Space0,
} satisfies Record<StandardNavigationRailProps & BaseNavigationProps & ModalNavigationRailProps, any>)

export const NavigationRailCollapsedXRDefinition = createStyleDefinition({
    'scrim-color'                             : Color.Scrim,
    'divider-color'                           : Color.OutlineVariant,
    'scrim-opacity'                           : `0.38`,
    'standard-container-width'                   : `96px`,
    'standard-container-shape'                   : Shape.ExtraExtraLarge,
    'standard-container-color'                   : `transparent`,
    'standard-container-item-gap'                : Space.Space500,
    'standard-container-block-leading-space'     : Space.Space250,
    'standard-container-block-trailing-space'    : Space.Space250,
    'standard-container-inline-leading-space'    : Space.Space0,
    'standard-container-inline-trailing-space'   : Space.Space0,
    'standard-segments-item-gap'                 : Space.Space50,
    'standard-segments-block-leading-space'      : Space.Space0,
    'standard-segments-block-trailing-space'     : Space.Space0,
    'standard-segments-inline-leading-space'     : Space.Space0,
    'standard-segments-inline-trailing-space'    : Space.Space0,
    'standard-menu-and-fab-item-gap'             : Space.Space50,
    'standard-menu-and-fab-block-leading-space'  : Space.Space0,
    'standard-menu-and-fab-block-trailing-space' : Space.Space0,
    'standard-menu-and-fab-inline-leading-space' : Space.Space0,
    'standard-menu-and-fab-inline-trailing-space': Space.Space0,
} satisfies Record<StandardNavigationRailProps & BaseNavigationProps, any>)
