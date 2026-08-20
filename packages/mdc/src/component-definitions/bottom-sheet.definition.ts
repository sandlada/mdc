/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// TODO(brief-deviation): brief specified `Elevation.Level1` but `@sandlada/mdk`
// exports the class as `ElevationLevel` (no `Elevation` export). Using
// `ElevationLevel.Level1` matches the project convention used by
// side-sheet.definition.ts / dialog.definition.ts / search.definition.ts.
import { ElevationLevel, Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definitions for `mdc-bottom-sheet`.
 *
 * Both variants share structural tokens (detent heights, shapes, padding,
 * drag-handle geometry). They differ in container surface color — `Standard`
 * uses `Color.Surface`, `Modal` uses `Color.SurfaceContainerLow`, matching
 * the `app:backgroundTint` defaults from the Material Components Android
 * reference.
 *
 * Field naming follows the project's style-definition conventions:
 *  - `enabled-*` prefix for default state
 *  - `container-*` prefix for the panel surface
 *  - shapes expand to four corner fields
 *  - paddings use the `*-inline-leading-padding-space` pattern
 */
const sharedStructural = {
    // Detent heights
    'enabled-container-max-height-peek'              : `40vh`,
    'enabled-container-max-height-full'              : `96vh`,

    // Container shape (top corners rounded; bottom flush against viewport)
    'container-shape-start-start'                    : Shape.ExtraLarge,
    'container-shape-start-end'                      : Shape.ExtraLarge,
    'container-shape-end-start'                      : `0`,
    'container-shape-end-end'                        : `0`,

    // Container elevation
    'container-elevation'                             : ElevationLevel.Level1,
    'container-shadow-color'                          : Color.Shadow,

    // Body content padding (the developer fills this with whatever they want)
    'content-container-inline-leading-padding-space'  : `24px`,
    'content-container-inline-trailing-padding-space' : `24px`,
    'content-container-block-leading-padding-space'   : `16px`,
    'content-container-block-trailing-padding-space'  : `24px`,

    // Drag handle geometry (per MD3 spec: centered bar with 22dp top/bottom padding)
    'drag-handle-width'                              : `32px`,
    'drag-handle-height'                             : `4px`,
    'drag-handle-shape'                              : `2px`,
    'drag-handle-container-block-leading-padding-space'  : `22px`,
    'drag-handle-container-block-trailing-padding-space' : `22px`,

    // Modal scrim
    'enabled-container-color-modal'                  : Color.Scrim,
    'enabled-container-opacity-modal'                : `0.32`,
} as const

/**
 * Standard bottom sheet — co-exists with main UI, no scrim, `surface`
 * background.
 */
export const StandardBottomSheetDefinition = createStyleDefinition({
    ...sharedStructural,
    'enabled-container-color'           : Color.Surface,
    'enabled-drag-handle-color'         : Color.OnSurfaceVariant,
})

/**
 * Modal bottom sheet — blocks interaction via scrim, uses
 * `surface-container-low` background per the Material Components Android
 * default.
 */
export const ModalBottomSheetDefinition = createStyleDefinition({
    ...sharedStructural,
    'enabled-container-color'           : Color.SurfaceContainerLow,
    'enabled-drag-handle-color'         : Color.OnSurfaceVariant,
})

/** Default definition — the standard variant. */
export const BottomSheetDefinition = StandardBottomSheetDefinition
