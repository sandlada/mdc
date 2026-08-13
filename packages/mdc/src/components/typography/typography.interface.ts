import type { LitElement } from 'lit'

export type TypographyVariant
    = 'display-large'
    | 'display-medium'
    | 'display-small'
    | 'headline-large'
    | 'headline-medium'
    | 'headline-small'
    | 'title-large'
    | 'title-medium'
    | 'title-small'
    | 'body-large'
    | 'body-medium'
    | 'body-small'
    | 'label-large'
    | 'label-medium'
    | 'label-small'

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
} as const satisfies Record<string, TypographyVariant>

export interface ITypography extends LitElement {
    emphasized: boolean
    variant   : TypographyVariant
}
