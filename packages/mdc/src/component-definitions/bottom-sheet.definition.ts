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
 *  - paddings use the `{padding|margin}-{inline|block}-{start|end}` pattern
 */
const sharedStructural = {
    // Detent heights
    'enabled-container-max-height-peek'              : `40vh`,
    'enabled-container-max-height-full'              : `96vh`,

    // Container shape (default enabled: top corners rounded ExtraLarge 28px; bottom flush 0 against viewport)
    'enabled-container-shape-start-start'            : Shape.ExtraLarge,
    'enabled-container-shape-start-end'              : Shape.ExtraLarge,
    'enabled-container-shape-end-start'              : `0`,
    'enabled-container-shape-end-end'                : `0`,

    // Container shape (dragged state: when dragged upwards off screen bottom, all 4 corners rounded)
    'dragged-container-shape-start-start'            : Shape.ExtraLarge,
    'dragged-container-shape-start-end'              : Shape.ExtraLarge,
    'dragged-container-shape-end-start'              : Shape.ExtraLarge,
    'dragged-container-shape-end-end'                : Shape.ExtraLarge,

    // Container elevation (unitless level string for mdc-elevation clamp/calc math)
    'enabled-container-elevation'                    : '1',
    'container-shadow-color'                         : Color.Shadow,

    // Header padding (upper slot)
    'header-container-padding-inline-start'           : `24px`,
    'header-container-padding-inline-end'             : `24px`,
    'header-container-padding-block-start'            : `0px`,
    'header-container-padding-block-end'              : `16px`,

    // Body content padding (the developer fills this with whatever they want)
    'content-container-padding-inline-start'          : `24px`,
    'content-container-padding-inline-end'           : `24px`,
    'content-container-padding-block-start'           : `16px`,
    'content-container-padding-block-end'             : `24px`,

    // Drag handle geometry (per MD3 spec: centered bar with 22dp top/bottom padding)
    'drag-handle-width'                               : `32px`,
    'drag-handle-height'                              : `4px`,
    'drag-handle-shape'                               : `2px`,
    'drag-handle-container-padding-inline-start'      : `0px`,
    'drag-handle-container-padding-inline-end'        : `0px`,
    'drag-handle-container-padding-block-start'       : `22px`,
    'drag-handle-container-padding-block-end'         : `22px`,

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
