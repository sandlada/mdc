import { Space, Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandTypescale } from '../../utils/style'

export const NavigationRailSectionHeaderDefinition = createStyleDefinition({
    ...expandTypescale('')(Typescale.LabelLarge),
    ...expandPadding('')([Space.Space0, Space.Space200]),
    color: Color.OnSurfaceVariant,
} as const)
