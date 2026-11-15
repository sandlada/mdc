import { Typescale } from '@sandlada/mdk'
import { createStyleDefinition, type PrimitiveTokenValue } from '../../utils/style'

export const TypographyRoles = ['display', 'headline', 'title', 'label', 'body'] as const
export const TypographySizes = ['small', 'medium', 'large'] as const
export const TypographyEmphases = ['regular', 'emphasized'] as const

export type TypographyRoles = (typeof TypographyRoles)[number]
export type TypographySizes = (typeof TypographySizes)[number]
export type TypographyEmphases = (typeof TypographyEmphases)[number]

/**
 * Joint `[role][size][emphasis]` scale pairs in dimension order.
 * Each cell holds `[regular, emphasized]` Typescale instances; the flat
 * token map below addresses every combination by an explicit
 * `${role}-${size}-${emphasis}-${prop}` key instead of positional arrays.
 */
const ScalePairs = [
    [[Typescale.DisplaySmall, Typescale.EmphasizedDisplaySmall], [Typescale.DisplayMedium, Typescale.EmphasizedDisplayMedium], [Typescale.DisplayLarge, Typescale.EmphasizedDisplayLarge]],
    [[Typescale.HeadlineSmall, Typescale.EmphasizedHeadlineSmall], [Typescale.HeadlineMedium, Typescale.EmphasizedHeadlineMedium], [Typescale.HeadlineLarge, Typescale.EmphasizedHeadlineLarge]],
    [[Typescale.TitleSmall, Typescale.EmphasizedTitleSmall], [Typescale.TitleMedium, Typescale.EmphasizedTitleMedium], [Typescale.TitleLarge, Typescale.EmphasizedTitleLarge]],
    [[Typescale.LabelSmall, Typescale.EmphasizedLabelSmall], [Typescale.LabelMedium, Typescale.EmphasizedLabelMedium], [Typescale.LabelLarge, Typescale.EmphasizedLabelLarge]],
    [[Typescale.BodySmall, Typescale.EmphasizedBodySmall], [Typescale.BodyMedium, Typescale.EmphasizedBodyMedium], [Typescale.BodyLarge, Typescale.EmphasizedBodyLarge]]
] as const

const PropMap = [
    ['font', 'Font'],
    ['size', 'FontSize'],
    ['weight', 'FontWeight'],
    ['leading', 'LineHeight'],
    ['tracking', 'Tracking']
] as const

const buildFlatTokens = (): Record<string, PrimitiveTokenValue> => {
    const flat: Record<string, PrimitiveTokenValue> = {}
    for (let r = 0; r < TypographyRoles.length; r++) {
        for (let s = 0; s < TypographySizes.length; s++) {
            for (let e = 0; e < TypographyEmphases.length; e++) {
                const row = ScalePairs[r] as readonly unknown[]
                const cell = row[s] as readonly unknown[]
                const instance = cell[e] as Record<string, unknown>
                const infix = `${TypographyRoles[r]}-${TypographySizes[s]}-${TypographyEmphases[e]}`
                for (const [suffix, prop] of PropMap) {
                    flat[`${infix}-${suffix}`] = instance[prop] as PrimitiveTokenValue
                }
            }
        }
    }
    return flat
}

export const TypographyDefinition = createStyleDefinition(buildFlatTokens())
