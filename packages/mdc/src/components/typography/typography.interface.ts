import type { LitElement } from 'lit'

export const TypographyVariant = {
    DisplayLarge: 'display-large',
    DisplayMedium: 'display-medium',
    DisplaySmall: 'display-small',

    HeadlineLarge: 'headline-large',
    HeadlineMedium: 'headline-medium',
    HeadlineSmall: 'headline-small',

    TitleLarge: 'title-large',
    TitleMedium: 'title-medium',
    TitleSmall: 'title-small',

    BodyLarge: 'body-large',
    BodyMedium: 'body-medium',
    BodySmall: 'body-small',

    LabelLarge: 'label-large',
    LabelMedium: 'label-medium',
    LabelSmall: 'label-small',
} as const
export type TypographyVariant = (typeof TypographyVariant)[keyof typeof TypographyVariant]

export interface ITypography extends LitElement {
    emphasized: boolean
    variant   : TypographyVariant
}
