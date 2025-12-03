/*!
 * @license
 * Copyright 2024 glare-labs & bre97-web
 * SPDX-License-Identifier: MIT
 */

export const MaterialDesignSystem = {
    Motion: {
        Easing: {
            Standard: `cubic-bezier(0.2, 0.0, 0, 1.0)`,
            StandardDecelerate: `cubic-bezier(0, 0, 0, 1)`,
            StandardAccelerate: `cubic-bezier(0.3, 0, 1, 1)`,
            Emphasized: `cubic-bezier(0.2, 0.0, 0, 1.0)`,
            EmphasizedDecelerate: `cubic-bezier(0.05, 0.7, 0.1, 1.0)`,
            EmphasizedAccelerate: `cubic-bezier(0.3, 0.0, 0.8, 0.15)`,
        },
        Duration: {
            Short1: `50ms`,
            Short2: `100ms`,
            Short3: `150ms`,
            Short4: `200ms`,
            Medium1: `250ms`,
            Medium2: `300ms`,
            Medium3: `350ms`,
            Medium4: `400ms`,
            Long1: `450ms`,
            Long2: `500ms`,
            Long3: `550ms`,
            Long4: `600ms`,
            ExtraLong1: `700ms`,
            ExtraLong2: `800ms`,
            ExtraLong3: `900ms`,
            ExtraLong4: `1000ms`,
        },
        Spring: {
            ExpressiveFastSpatial: {
                Easing: `cubic-bezier(0.42, 1.67, 0.21, 0.90)`,
                Duration: `350ms`
            },
            ExpressiveDefaultSpatial: {
                Easing: `cubic-bezier(0.38, 1.21, 0.22, 1.00)`,
                Duration: `500ms`
            },
            ExpressiveSlowSpatial: {
                Easing: `cubic-bezier(0.39, 1.29, 0.35, 0.98)`,
                Duration: `650ms`
            },
            ExpressiveFastEffects: {
                Easing: `cubic-bezier(0.31, 0.94, 0.34, 1.00)`,
                Duration: `150ms`
            },
            ExpressiveDefaultEffects: {
                Easing: `cubic-bezier(0.34, 0.80, 0.34, 1.00)`,
                Duration: `200ms`
            },
            ExpressiveSlowEffects: {
                Easing: `cubic-bezier(0.34, 0.88, 0.34, 1.00)`,
                Duration: `300ms`
            },
            StandardFastSpatial: {
                Easing: `cubic-bezier(0.27, 1.06, 0.18, 1.00)`,
                Duration: `350ms`
            },
            StandardDefaultSpatial: {
                Easing: `cubic-bezier(0.27, 1.06, 0.18, 1.00)`,
                Duration: `500ms`
            },
            StandardSlowSpatial: {
                Easing: `cubic-bezier(0.27, 1.06, 0.18, 1.00)`,
                Duration: `750ms`
            },
            StandardFastEffects: {
                Easing: `cubic-bezier(0.31, 0.94, 0.34, 1.00)`,
                Duration: `150ms`
            },
            StandardDefaultEffects: {
                Easing: `cubic-bezier(0.34, 0.80, 0.34, 1.00)`,
                Duration: `200ms`
            },
            StandardSlowEffects: {
                Easing: `cubic-bezier(0.34, 0.88, 0.34, 1.00)`,
                Duration: `300ms`
            },
        }
    },
    Shape: {
        None: `0px`,
        ExtraSmall: `4px`,
        Small: `8px`,
        Medium: `12px`,
        Large: `16px`,
        LargeIncreased: `20px`,
        ExtraLarge: `28px`,
        ExtraLargeIncreased: `32px`,
        ExtraExtraLarge: `48px`,
        Full: `calc(infinity * 1px)`,
    },
    Variant: {
        Monochrome: 0,
        Neutral: 1,
        TonalSpot: 2,
        Vibrant: 3,
        Expressive: 4,
        Fidelity: 5,
        Content: 6,
        Rainbow: 7,
        FruitSalad: 8
    },
    ContrastLevel: {
        Reduced: -1,
        Default: 0,
        Medium: 0.5,
        High: 1
    },
    Color: {
        Background: `var(--md-sys-color-background, #141218)` as string,
        OnBackground: `var(--md-sys-color-on-background, #e6e0e9)` as string,
        Surface: `var(--md-sys-color-surface, #141218)` as string,
        SurfaceDim: `var(--md-sys-color-surface-dim, #141218)` as string,
        SurfaceBright: `var(--md-sys-color-surface-bright, #3b383e)` as string,
        SurfaceContainerLowest: `var(--md-sys-color-surface-container-lowest, #0f0d13)` as string,
        SurfaceContainerLow: `var(--md-sys-color-surface-container-low, #1d1b20)` as string,
        SurfaceContainer: `var(--md-sys-color-surface-container, #211f26)` as string,
        SurfaceContainerHigh: `var(--md-sys-color-surface-container-high, #2b2930)` as string,
        SurfaceContainerHighest: `var(--md-sys-color-surface-container-highest, #36343b)` as string,
        OnSurface: `var(--md-sys-color-on-surface, #e6e0e9)` as string,
        SurfaceVariant: `var(--md-sys-color-surface-variant, #49454f)` as string,
        OnSurfaceVariant: `var(--md-sys-color-on-surface-variant, #cac4d0)` as string,
        InverseSurface: `var(--md-sys-color-inverse-surface, #e7e0ec)` as string,
        InverseOnSurface: `var(--md-sys-color-inverse-on-surface, #322f35)` as string,
        Outline: `var(--md-sys-color-outline, #938f99)` as string,
        OutlineVariant: `var(--md-sys-color-outline-variant, #49454f)` as string,
        Shadow: `var(--md-sys-color-shadow, #000)` as string,
        Scrim: `var(--md-sys-color-scrim, #000)` as string,
        SurfaceTint: `var(--md-sys-color-surface-tint, #d0bcff)` as string,
        Primary: `var(--md-sys-color-primary, #d0bcff)` as string,
        OnPrimary: `var(--md-sys-color-on-primary, #381e72)` as string,
        PrimaryContainer: `var(--md-sys-color-primary-container, #4f378b)` as string,
        OnPrimaryContainer: `var(--md-sys-color-on-primary-container, #eaddff)` as string,
        InversePrimary: `var(--md-sys-color-inverse-primary, #6750a4)` as string,
        Secondary: `var(--md-sys-color-secondary, #ccc2dc)` as string,
        OnSecondary: `var(--md-sys-color-on-secondary, #332d41)` as string,
        SecondaryContainer: `var(--md-sys-color-secondary-container, #4a4458)` as string,
        OnSecondaryContainer: `var(--md-sys-color-on-secondary-container, #e8def8)` as string,
        Tertiary: `var(--md-sys-color-tertiary, #efb8c8)` as string,
        OnTertiary: `var(--md-sys-color-on-tertiary, #492532)` as string,
        TertiaryContainer: `var(--md-sys-color-tertiary-container, #633b48)` as string,
        OnTertiaryContainer: `var(--md-sys-color-on-tertiary-container, #ffd8e4)` as string,
        Error: `var(--md-sys-color-error, #f2b8b5)` as string,
        OnError: `var(--md-sys-color-on-error, #601410)` as string,
        ErrorContainer: `var(--md-sys-color-error-container, #8c1d18)` as string,
        OnErrorContainer: `var(--md-sys-color-on-error-container, #f9dedc)` as string,
        PrimaryFixed: `var(--md-sys-color-primary-fixed, #eaddff)` as string,
        PrimaryFixedDim: `var(--md-sys-color-primary-fixed-dim, #d0bcff)` as string,
        OnPrimaryFixed: `var(--md-sys-color-on-primary-fixed, #21005d)` as string,
        OnPrimaryFixedVariant: `var(--md-sys-color-on-primary-fixed-variant, #4f378b)` as string,
        SecondaryFixed: `var(--md-sys-color-secondary-fixed, #e8def8)` as string,
        SecondaryFixedDim: `var(--md-sys-color-secondary-fixed-dim, #ccc2dc)` as string,
        OnSecondaryFixed: `var(--md-sys-color-on-secondary-fixed, #1d192b)` as string,
        OnSecondaryFixedVariant: `var(--md-sys-color-on-secondary-fixed-variant, #4a4458)` as string,
        TertiaryFixed: `var(--md-sys-color-tertiary-fixed, #ffd8e4)` as string,
        TertiaryFixedDim: `var(--md-sys-color-tertiary-fixed-dim, #efb8c8)` as string,
        OnTertiaryFixed: `var(--md-sys-color-on-tertiary-fixed, #31111d)` as string,
        OnTertiaryFixedVariant: `var(--md-sys-color-on-tertiary-fixed-variant, #633b48)` as string,
    },
} as const

export type TMaterialVariant = typeof MaterialDesignSystem.Variant[keyof typeof MaterialDesignSystem.Variant]
export type TMaterialContrastLevel = typeof MaterialDesignSystem.ContrastLevel[keyof typeof MaterialDesignSystem.ContrastLevel] | number
export type TMaterialColorSchemeObject = typeof MaterialDesignSystem.Color
export type TMaterialColorSchemeObjectKey = Partial<keyof typeof MaterialDesignSystem.Color>
