/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandShape, expandTypescale } from '../../utils/style'

/**
 * Shared structural & typography tokens for `mdc-popover`.
 */
const PopoverSharedTokens = {
    ...expandShape('enabled-container-shape')(Shape.Large),
    ...expandPadding('enabled-container-padding')({ block: '16px', inline: '16px' }),
    ...expandTypescale('enabled-header')(Typescale.TitleMedium),
    ...expandTypescale('enabled-body')(Typescale.BodyMedium),

    'enabled-container-min-width': `180px`,
    'enabled-container-max-width': `380px`,
    'enabled-container-max-height': `calc(100vh - 32px)`,
    'enabled-section-gap': `12px`,
    'enabled-arrow-size': `10px`,
    'enabled-outline-width': `0px`,
    'enabled-outline-color': `transparent`,
    'enabled-scrim-color': Color.Scrim,
    'enabled-scrim-opacity': `0.32`,
}

export const StandardPopoverDefinition = createStyleDefinition({
    ...PopoverSharedTokens,
    'enabled-container-color': Color.SurfaceContainerLow,
    'enabled-container-text-color': Color.OnSurfaceVariant,
    'enabled-header-text-color': Color.OnSurface,
    'enabled-container-elevation': ElevationLevel.Level3,
})

export const OutlinedPopoverDefinition = createStyleDefinition({
    ...PopoverSharedTokens,
    'enabled-container-color': Color.Surface,
    'enabled-container-text-color': Color.OnSurface,
    'enabled-header-text-color': Color.OnSurface,
    'enabled-container-elevation': ElevationLevel.Level1,
    'enabled-outline-width': `1px`,
    'enabled-outline-color': Color.OutlineVariant,
})

export const VibrantPopoverDefinition = createStyleDefinition({
    ...PopoverSharedTokens,
    'enabled-container-color': Color.TertiaryContainer,
    'enabled-container-text-color': Color.OnTertiaryContainer,
    'enabled-header-text-color': Color.OnTertiaryContainer,
    'enabled-container-elevation': ElevationLevel.Level2,
})

export const PopoverDefinitions = {
    Standard: StandardPopoverDefinition,
    Outlined: OutlinedPopoverDefinition,
    Vibrant: VibrantPopoverDefinition,
} as const
