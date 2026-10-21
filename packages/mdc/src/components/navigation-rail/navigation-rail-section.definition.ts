import { Space } from '@sandlada/mdk'
import { createStyleDefinition } from '../../utils/style'

export const NavigationRailSectionDefinition = createStyleDefinition({
    // Segments
    'item-between': {
        collapsed: Space.Space50,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space50,
    },
    'padding-block-start': {
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    },
    'padding-block-end': {
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    },
    'padding-inline-start': {
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    },
    'padding-inline-end': {
        collapsed: Space.Space0,
        expandedDocked: Space.Space0,
        expandedFloating: Space.Space0,
        xr: Space.Space0,
    },
} as const)
