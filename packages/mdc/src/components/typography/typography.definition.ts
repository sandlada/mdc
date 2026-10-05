import { Typescale } from '@sandlada/mdk'
import { createStyleDefinition, type PrimitiveTokenValue } from '../../utils/style'

export const typographyRoles = ['display', 'headline', 'title', 'label', 'body'] as const
export const typographySizes = ['small', 'medium', 'large'] as const
export const typographyEmphases = ['regular', 'emphasized'] as const

export type TypographyRole = (typeof typographyRoles)[number]
export type TypographySize = (typeof typographySizes)[number]
export type TypographyEmphasis = (typeof typographyEmphases)[number]

/**
 * Joint `[role][size][emphasis]` scale pairs in dimension order.
 * Each cell holds `[regular, emphasized]` Typescale instances; the flat
 * token map below addresses every combination by an explicit
 * `${role}-${size}-${emphasis}-${prop}` key instead of positional arrays.
 */
const scalePairs = [
    [[Typescale.DisplaySmall, Typescale.EmphasizedDisplaySmall], [Typescale.DisplayMedium, Typescale.EmphasizedDisplayMedium], [Typescale.DisplayLarge, Typescale.EmphasizedDisplayLarge]],
    [[Typescale.HeadlineSmall, Typescale.EmphasizedHeadlineSmall], [Typescale.HeadlineMedium, Typescale.EmphasizedHeadlineMedium], [Typescale.HeadlineLarge, Typescale.EmphasizedHeadlineLarge]],
    [[Typescale.TitleSmall, Typescale.EmphasizedTitleSmall], [Typescale.TitleMedium, Typescale.EmphasizedTitleMedium], [Typescale.TitleLarge, Typescale.EmphasizedTitleLarge]],
    [[Typescale.LabelSmall, Typescale.EmphasizedLabelSmall], [Typescale.LabelMedium, Typescale.EmphasizedLabelMedium], [Typescale.LabelLarge, Typescale.EmphasizedLabelLarge]],
    [[Typescale.BodySmall, Typescale.EmphasizedBodySmall], [Typescale.BodyMedium, Typescale.EmphasizedBodyMedium], [Typescale.BodyLarge, Typescale.EmphasizedBodyLarge]]
] as const

const propMap = [
    ['font', 'Font'],
    ['size', 'FontSize'],
    ['weight', 'FontWeight'],
    ['leading', 'LineHeight'],
    ['tracking', 'Tracking']
] as const

const buildFlatTokens = (): Record<string, PrimitiveTokenValue> => {
    const flat: Record<string, PrimitiveTokenValue> = {}
    for (let r = 0; r < typographyRoles.length; r++) {
        for (let s = 0; s < typographySizes.length; s++) {
            for (let e = 0; e < typographyEmphases.length; e++) {
                const row = scalePairs[r] as readonly unknown[]
                const cell = row[s] as readonly unknown[]
                const instance = cell[e] as Record<string, unknown>
                const infix = `${typographyRoles[r]}-${typographySizes[s]}-${typographyEmphases[e]}`
                for (const [suffix, prop] of propMap) {
                    flat[`${infix}-${suffix}`] = instance[prop] as PrimitiveTokenValue
                }
            }
        }
    }
    return flat
}

export const TypographyDefinition = createStyleDefinition(buildFlatTokens())
