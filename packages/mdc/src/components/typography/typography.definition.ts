import { Typescale } from '@sandlada/mdk'
import { createStyleDefinition, defineSchema } from '@sandlada/styles/schema'

export const TypographySchema = defineSchema([
    ['display', 'headline', 'title', 'label', 'body'],
    ['small', 'medium', 'large'],
    ['regular', 'emphasized']
] as const)

/**
 * Joint `[role][size][emphasis]` scale pairs in schema dimension order.
 * Each cell holds `[regular, emphasized]` Typescale instances, so every
 * `def` value below addresses its full Cartesian combination positionally
 * (`cell[role][size][emphasis]`) instead of hand-flattened token keys.
 */
const scalePairs = [
    [[Typescale.DisplaySmall, Typescale.EmphasizedDisplaySmall], [Typescale.DisplayMedium, Typescale.EmphasizedDisplayMedium], [Typescale.DisplayLarge, Typescale.EmphasizedDisplayLarge]],
    [[Typescale.HeadlineSmall, Typescale.EmphasizedHeadlineSmall], [Typescale.HeadlineMedium, Typescale.EmphasizedHeadlineMedium], [Typescale.HeadlineLarge, Typescale.EmphasizedHeadlineLarge]],
    [[Typescale.TitleSmall, Typescale.EmphasizedTitleSmall], [Typescale.TitleMedium, Typescale.EmphasizedTitleMedium], [Typescale.TitleLarge, Typescale.EmphasizedTitleLarge]],
    [[Typescale.LabelSmall, Typescale.EmphasizedLabelSmall], [Typescale.LabelMedium, Typescale.EmphasizedLabelMedium], [Typescale.LabelLarge, Typescale.EmphasizedLabelLarge]],
    [[Typescale.BodySmall, Typescale.EmphasizedBodySmall], [Typescale.BodyMedium, Typescale.EmphasizedBodyMedium], [Typescale.BodyLarge, Typescale.EmphasizedBodyLarge]]
] as const

type TypescaleProp = 'Font' | 'FontSize' | 'FontWeight' | 'LineHeight' | 'Tracking'

const pickProp = (prop: TypescaleProp) => scalePairs.map(row => row.map(([regular, emphasized]) => [regular[prop], emphasized[prop]] as const))

export const TypographyDefinition = createStyleDefinition(TypographySchema)({
    'font': pickProp('Font'),
    'size': pickProp('FontSize'),
    'weight': pickProp('FontWeight'),
    'leading': pickProp('LineHeight'),
    'tracking': pickProp('Tracking')
})
