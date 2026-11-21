/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @version
 * 1.0.0
 */
import { ElevationLevel, Shape, State, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import {
    createStyleDefinition,
    expandPadding,
    expandShape,
    expandTypescale,
    type PrimitiveTokenValue,
} from '../../utils/style'

/**
 * Shared (non-color) tokens for `<mdc-expansion-panel>`.
 *
 * Grounded in Android / AndroidX (`ExpandableListView`, `Preference`,
 * `MaterialCardView`) and Material Design 3 / Expansion Panel specifications:
 * - Header min-height: 48px (small), 56px (medium), 72px (large)
 * - Leading icon: 24px; Expand indicator: 24px
 * - Headline: TitleMedium; Supporting text / summary: BodyMedium; Body: BodyMedium
 * - Corner shapes: Round (`Shape.Medium` = 12px), Square (`Shape.ExtraSmall` = 4px)
 */
const SharedPanel = {
    // Geometry per size
    'header-min-height': {
        'small' : `48px`,
        'medium': `56px`,
        'large' : `72px`,
    },
    'header-gap': {
        'small' : `12px`,
        'medium': `16px`,
        'large' : `16px`,
    },
    ...expandPadding('header-padding')({
        'small' : { block: `8px`, inline: `16px` },
        'medium': { block: `12px`, inline: `16px` },
        'large' : { block: `16px`, inline: `20px` },
    }),
    ...expandPadding('body-padding')({
        'small' : { blockStart: `0px`, blockEnd: `12px`, inlineStart: `16px`, inlineEnd: `16px` },
        'medium': { blockStart: `0px`, blockEnd: `16px`, inlineStart: `16px`, inlineEnd: `16px` },
        'large' : { blockStart: `0px`, blockEnd: `20px`, inlineStart: `20px`, inlineEnd: `20px` },
    }),
    ...expandPadding('actions-padding')({
        'small' : { block: `8px`, inline: `12px` },
        'medium': { block: `10px`, inline: `16px` },
        'large' : { block: `12px`, inline: `20px` },
    }),
    'actions-gap': `8px`,
    'header-text-gap': `2px`,

    // Icons
    'icon-size'       : `24px`,
    'expand-icon-size': `24px`,

    // Shapes
    ...expandShape('round-container-shape')(Shape.Medium),
    ...expandShape('square-container-shape')(Shape.ExtraSmall),

    // Outline & divider
    'outline-width'    : `1px`,
    'divider-thickness': `1px`,

    // Typography
    ...expandTypescale('headline')(Typescale.TitleMedium),
    ...expandTypescale('supporting-text')(Typescale.BodyMedium),
    ...expandTypescale('body')(Typescale.BodyMedium),

    // State layers & disabled
    'hovered-state-layer-opacity' : State.HoveredStateLayerOpacity,
    'focused-state-layer-opacity' : State.FocusedStateLayerOpacity,
    'pressed-state-layer-opacity' : State.PressedStateLayerOpacity,
    'disabled-content-opacity'    : `0.38`,
} as const

interface ExpansionPanelVariantTokens {
    container: PrimitiveTokenValue
    expandedContainer: PrimitiveTokenValue
    outline: PrimitiveTokenValue
    divider: PrimitiveTokenValue
    headline: PrimitiveTokenValue
    supportingText: PrimitiveTokenValue
    body: PrimitiveTokenValue
    icon: PrimitiveTokenValue
    expandIcon: PrimitiveTokenValue
    stateLayer: PrimitiveTokenValue
    elevation: PrimitiveTokenValue
    expandedElevation: PrimitiveTokenValue
    shadowColor: PrimitiveTokenValue
}

const createExpansionPanelVariant = (tokens: ExpansionPanelVariantTokens) => createStyleDefinition({
    ...SharedPanel,
    'enabled-container-color'          : tokens.container,
    'expanded-container-color'         : tokens.expandedContainer,
    'enabled-outline-color'            : tokens.outline,
    'enabled-divider-color'            : tokens.divider,
    'enabled-headline-color'           : tokens.headline,
    'enabled-supporting-text-color'    : tokens.supportingText,
    'enabled-body-color'               : tokens.body,
    'enabled-icon-color'               : tokens.icon,
    'enabled-expand-icon-color'        : tokens.expandIcon,
    'state-layer-color'                : tokens.stateLayer,
    'enabled-container-elevation'      : tokens.elevation,
    'expanded-container-elevation'     : tokens.expandedElevation,
    'container-shadow-color'           : tokens.shadowColor,
})

// ─── Panel Variant Definitions ──────────────────────────────────────────────

export const OutlinedExpansionPanelDefinition = createExpansionPanelVariant({
    container        : Color.Surface,
    expandedContainer: Color.Surface,
    outline          : Color.OutlineVariant,
    divider          : Color.OutlineVariant,
    headline         : Color.OnSurface,
    supportingText   : Color.OnSurfaceVariant,
    body             : Color.OnSurfaceVariant,
    icon             : Color.OnSurfaceVariant,
    expandIcon       : Color.OnSurfaceVariant,
    stateLayer       : Color.OnSurface,
    elevation        : ElevationLevel.Level0.Value,
    expandedElevation: ElevationLevel.Level0.Value,
    shadowColor      : Color.Shadow,
})

export const ElevatedExpansionPanelDefinition = createExpansionPanelVariant({
    container        : Color.SurfaceContainerLow,
    expandedContainer: Color.SurfaceContainerLow,
    outline          : `transparent`,
    divider          : Color.OutlineVariant,
    headline         : Color.OnSurface,
    supportingText   : Color.OnSurfaceVariant,
    body             : Color.OnSurfaceVariant,
    icon             : Color.OnSurfaceVariant,
    expandIcon       : Color.OnSurfaceVariant,
    stateLayer       : Color.OnSurface,
    elevation        : ElevationLevel.Level1.Value,
    expandedElevation: ElevationLevel.Level2.Value,
    shadowColor      : Color.Shadow,
})

export const FilledExpansionPanelDefinition = createExpansionPanelVariant({
    container        : Color.SurfaceContainerLow,
    expandedContainer: Color.SurfaceContainer,
    outline          : `transparent`,
    divider          : Color.OutlineVariant,
    headline         : Color.OnSurface,
    supportingText   : Color.OnSurfaceVariant,
    body             : Color.OnSurfaceVariant,
    icon             : Color.OnSurfaceVariant,
    expandIcon       : Color.OnSurfaceVariant,
    stateLayer       : Color.OnSurface,
    elevation        : ElevationLevel.Level0.Value,
    expandedElevation: ElevationLevel.Level0.Value,
    shadowColor      : Color.Shadow,
})

export const FlatExpansionPanelDefinition = createExpansionPanelVariant({
    container        : `transparent`,
    expandedContainer: `transparent`,
    outline          : `transparent`,
    divider          : Color.OutlineVariant,
    headline         : Color.OnSurface,
    supportingText   : Color.OnSurfaceVariant,
    body             : Color.OnSurfaceVariant,
    icon             : Color.OnSurfaceVariant,
    expandIcon       : Color.OnSurfaceVariant,
    stateLayer       : Color.OnSurface,
    elevation        : ElevationLevel.Level0.Value,
    expandedElevation: ElevationLevel.Level0.Value,
    shadowColor      : Color.Shadow,
})

export const ExpansionPanelDefinition = OutlinedExpansionPanelDefinition

// ─── Accordion Container Definition ─────────────────────────────────────────

export const AccordionDefinition = createStyleDefinition({
    'panel-gap': {
        'small' : `8px`,
        'medium': `12px`,
        'large' : `16px`,
    },
})
