/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
// TODO(brief-deviation): brief specified `Elevation.Level1` but `@sandlada/mdk`
// exports the class as `ElevationLevel` (no `Elevation` export). Using
// `ElevationLevel.Level1` matches the project convention used by
// dialog.definition.ts / search.definition.ts / tab.definition.ts.
import { ElevationLevel, Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * Style definitions for `mdc-side-sheet`.
 *
 * Variant tokens map directly to MD3 spec values from
 * https://m3.material.io/components/side-sheets/spec and the project's
 * design-source folder. Field naming follows the project's
 * style-definition conventions:
 *  - `enabled-*` prefix for default (un-hovered, un-pressed, un-focused) state
 *  - `container-*` prefix for the panel surface
 *  - shapes expand to four corner fields
 *  - paddings use the `*-inline-leading-padding-space` pattern
 *
 * Both variants share the same structural tokens (sizes, shapes) but
 * differ in colors — `Standard` uses `Color.Surface` and
 * `Modal` uses `Color.SurfaceContainerLow`, matching the
 * `app:backgroundTint` defaults from the Material Components Android
 * reference.
 */
const sharedStructural = {
    // Container shape (default enabled: end edge corners 0 when docked, start edge corners ExtraLarge 28px)
    'enabled-container-shape-start-start'      : Shape.ExtraLarge,
    'enabled-container-shape-start-end'        : `0`,
    'enabled-container-shape-end-start'        : Shape.ExtraLarge,
    'enabled-container-shape-end-end'          : `0`,

    // Container shape (dragged state: when dragged, right corners match left corners - all 4 corners ExtraLarge 28px)
    'dragged-container-shape-start-start'      : Shape.ExtraLarge,
    'dragged-container-shape-start-end'        : Shape.ExtraLarge,
    'dragged-container-shape-end-start'        : Shape.ExtraLarge,
    'dragged-container-shape-end-end'          : Shape.ExtraLarge,

    // Container elevation (unitless integer level string for mdc-elevation clamp/calc math)
    'enabled-container-elevation'              : '1',
    'container-shadow-color'                   : Color.Shadow,

    // Headline padding (24dp per spec)
    'headline-container-inline-leading-padding-space'  : `24px`,
    'headline-container-inline-trailing-padding-space' : `12px`,
    'headline-container-block-leading-padding-space'   : `24px`,
    'headline-container-block-trailing-padding-space'  : `12px`,

    // Body content padding (24dp per spec)
    'content-container-inline-leading-padding-space'  : `24px`,
    'content-container-inline-trailing-padding-space' : `24px`,
    'content-container-block-leading-padding-space'   : `16px`,
    'content-container-block-trailing-padding-space'  : `24px`,

    // Actions padding + height (16dp top, 24dp bottom, 72dp row per spec)
    'actions-container-block-leading-padding-space'   : `16px`,
    'actions-container-block-trailing-padding-space'  : `24px`,
    'actions-container-height'                         : `72px`,

    // Modal-only start padding with icon (16dp)
    'headline-icon-container-inline-leading-padding-space': `16px`,

    // Scrim opacity (MD3 modal scrim)
    'enabled-container-color-modal'            : Color.Scrim,
    'enabled-container-opacity-modal'          : `0.32`,

    // Icon sizes
    'close-icon-size'                          : `24px`,
    'headline-icon-size'                       : `24px`,
} as const

/**
 * Standard side sheet — co-exists with main UI, no scrim, `surface` background.
 */
export const StandardSideSheetDefinition = createStyleDefinition({
    ...sharedStructural,
    'enabled-container-color'           : Color.Surface,
    'enabled-headline-color'            : Color.OnSurfaceVariant,
    'enabled-close-icon-color'          : Color.OnSurfaceVariant,
    'enabled-headline-icon-color'       : Color.OnSurfaceVariant,
    'enabled-divider-color'             : Color.OutlineVariant,
})

/**
 * Modal side sheet — blocks interaction via scrim, uses `surface-container-low`
 * background per the Material Components Android default.
 */
export const ModalSideSheetDefinition = createStyleDefinition({
    ...sharedStructural,
    'enabled-container-color'           : Color.SurfaceContainerLow,
    'enabled-headline-color'            : Color.OnSurfaceVariant,
    'enabled-close-icon-color'          : Color.OnSurfaceVariant,
    'enabled-headline-icon-color'       : Color.OnSurfaceVariant,
    'enabled-divider-color'             : Color.OutlineVariant,
})

/** Default definition — the standard variant. */
export const SideSheetDefinition = StandardSideSheetDefinition