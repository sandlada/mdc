/**
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

export const TypographyVariant = {
    LabelSmall: 'label-small',
    LabelMedium: 'label-medium',
    LabelLarge: 'label-large',
    BodySmall: 'body-small',
    BodyMedium: 'body-medium',
    BodyLarge: 'body-large',
    TitleSmall: 'title-small',
    TitleMedium: 'title-medium',
    TitleLarge: 'title-large',
    HeadlineSmall: 'headline-small',
    HeadlineMedium: 'headline-medium',
    HeadlineLarge: 'headline-large',
    DisplaySmall: 'display-small',
    DisplayMedium: 'display-medium',
    DisplayLarge: 'display-large',
} as const

export type TTypographyVariant = typeof TypographyVariant[keyof typeof TypographyVariant]
