/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, type PrimitiveTokenValue } from '../../utils/style'
import { expandPadding, expandShape, expandTypescale } from '../../utils/style'


/**
 * Per-size shared tokens. Interaction states are expressed through flat
 * `enabled-` / `hovered-` / `focused-` / `pressed-` keys (the element drives
 * state styling with plain selectors, not through a state schema).
 */
const fabSharedTokens = {
    ...expandShape('container-shape')({
        small : Shape.Large,
        medium: Shape.LargeIncreased,
        large : Shape.ExtraLarge
    }),

    'container-height': {
        small : '56px',
        medium: '80px',
        large : '96px'
    },
    'container-width': {
        small : '56px',
        medium: '80px',
        large : '96px'
    },
    'icon-size': {
        small : '24px',
        medium: '28px',
        large : '36px'
    },

    // Shadow & elevation (MD3 FAB: level 3 at rest, raised to level 4 on hover)
    'enabled-container-shadow-color': Color.Shadow,
    'enabled-container-elevation'   : ElevationLevel.Level3,
    'hovered-container-elevation'   : ElevationLevel.Level4,
    'focused-container-elevation'   : ElevationLevel.Level3,
    'pressed-container-elevation'   : ElevationLevel.Level3,

    // State layer opacities
    'hovered-state-layer-opacity': State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity': State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity': State.PressedStateLayerOpacity,

    'icon-label-space': {
        small : `8px`,
        medium: `12px`,
        large : `16px`
    }
} as const

const fabVariantTokens = (
    containerColor: PrimitiveTokenValue,
    onContainerColor: PrimitiveTokenValue
) => ({
    ...fabSharedTokens,

    // Enabled
    'enabled-container-color'       : containerColor,
    'enabled-icon-color'            : onContainerColor,

    // Hovered
    'hovered-state-layer-color': onContainerColor,
    'hovered-icon-color'       : onContainerColor,

    // Focused
    'focused-state-layer-color': onContainerColor,
    'focused-icon-color'       : onContainerColor,

    // Pressed
    'pressed-state-layer-color': onContainerColor,
    'pressed-icon-color'       : onContainerColor,

    // Label colors (uniform across interaction states)
    'enabled-label-color': onContainerColor,
    'hovered-label-color': onContainerColor,
    'focused-label-color': onContainerColor,
    'pressed-label-color': onContainerColor,
})

export const TonalPrimaryFabDefinition = createStyleDefinition(
    fabVariantTokens(Color.PrimaryContainer, Color.OnPrimaryContainer)
)

export const TonalSecondaryFabDefinition = createStyleDefinition(
    fabVariantTokens(Color.SecondaryContainer, Color.OnSecondaryContainer)
)

export const TonalTertiaryFabDefinition = createStyleDefinition(
    fabVariantTokens(Color.TertiaryContainer, Color.OnTertiaryContainer)
)

export const PrimaryFabDefinition = createStyleDefinition(
    fabVariantTokens(Color.Primary, Color.OnPrimary)
)

export const SecondaryFabDefinition = createStyleDefinition(
    fabVariantTokens(Color.Secondary, Color.OnSecondary)
)

export const TertiaryFabDefinition = createStyleDefinition(
    fabVariantTokens(Color.Tertiary, Color.OnTertiary)
)

const fabExtendedSharedTokens = {
    ...expandTypescale('label')({
        small : Typescale.TitleMedium,
        medium: Typescale.TitleLarge,
        large : Typescale.HeadlineSmall
    }),
    ...expandPadding('container-padding')({
        small : { block: '0px', inlineStart: '16px', inlineEnd: '16px' },
        medium: { block: '0px', inlineStart: '26px', inlineEnd: '26px' },
        large : { block: '0px', inlineStart: '28px', inlineEnd: '28px' }
    })
}

export const TonalPrimaryExtendedFabDefinition = createStyleDefinition({
    ...fabVariantTokens(Color.PrimaryContainer, Color.OnPrimaryContainer),
    ...fabExtendedSharedTokens
})
export const TonalSecondaryExtendedFabDefinition = createStyleDefinition({
    ...fabVariantTokens(Color.SecondaryContainer, Color.OnSecondaryContainer),
    ...fabExtendedSharedTokens
})
export const TonalTertiaryExtendedFabDefinition = createStyleDefinition({
    ...fabVariantTokens(Color.TertiaryContainer, Color.OnTertiaryContainer),
    ...fabExtendedSharedTokens
})
export const PrimaryExtendedFabDefinition = createStyleDefinition({
    ...fabVariantTokens(Color.Primary, Color.OnPrimary),
    ...fabExtendedSharedTokens
})
export const SecondaryExtendedFabDefinition = createStyleDefinition({
    ...fabVariantTokens(Color.Secondary, Color.OnSecondary),
    ...fabExtendedSharedTokens
})
export const TertiaryExtendedFabDefinition = createStyleDefinition({
    ...fabVariantTokens(Color.Tertiary, Color.OnTertiary),
    ...fabExtendedSharedTokens
})

export const FabVariants = {
    'primary': PrimaryExtendedFabDefinition,
    'secondary': SecondaryExtendedFabDefinition,
    'tertiary': TertiaryExtendedFabDefinition,
    'tonal-primary': TonalPrimaryExtendedFabDefinition,
    'tonal-secondary': TonalSecondaryExtendedFabDefinition,
    'tonal-tertiary': TonalTertiaryExtendedFabDefinition,
} as const
