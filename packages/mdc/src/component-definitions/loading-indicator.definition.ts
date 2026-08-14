/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

/**
 * MD3 Expressive Loading Indicator style tokens, aligned with
 * `LoadingIndicatorTokens` from androidx.compose.material3 (v0.7.0) and
 * extended to a per-variant color-role scheme.
 *
 * Layout:
 *
 * | token            | Compose source                       | value   |
 * | ---------------- | ------------------------------------ | ------- |
 * | `container-size` | `ContainerWidth` / `ContainerHeight` | `48px`  |
 * | `indicator-size` | `ActiveSize`                         | `38px`  |
 * | `container-shape`| `ContainerShape`                     | `CornerFull` |
 *
 * Appearance mode (selected via the `contained` attribute):
 *
 * | mode          | container background          | indicator color          |
 * | ------------- | ----------------------------- | ------------------------ |
 * | uncontained   | `uncontained-container-color` | `uncontained-indicator-color` |
 * | contained     | `contained-container-color`   | `contained-indicator-color`   |
 *
 * Color variant (selected via the `variant` attribute): each variant re-keys
 * the three color tokens through a `-{variant}` suffix, in CSS through
 * `:host([variant='…'])`. Defaults = `primary`:
 *
 * | variant   | uncontained indicator | contained container  | contained indicator    |
 * | --------- | --------------------- | -------------------- | ---------------------- |
 * | primary   | `Primary`             | `PrimaryContainer`   | `OnPrimaryContainer`   |
 * | secondary | `Secondary`           | `SecondaryContainer` | `OnSecondaryContainer` |
 * | tertiary  | `Tertiary`            | `TertiaryContainer`  | `OnTertiaryContainer`  |
 * | error     | `Error`               | `ErrorContainer`     | `OnErrorContainer`     |
 * | surface   | `Surface`             | `SurfaceContainer`   | `OnSurface`            |
 */
export const LoadingIndicatorDefinition = createStyleDefinition({
    'container-size' : '48px',
    'indicator-size' : '38px',
    'container-shape': Shape.Full,

    'uncontained-container-color': 'transparent',
    'uncontained-indicator-color': Color.Primary,
    'contained-container-color'  : Color.PrimaryContainer,
    'contained-indicator-color'  : Color.OnPrimaryContainer,

    'uncontained-indicator-color-secondary': Color.Secondary,
    'contained-container-color-secondary'  : Color.SecondaryContainer,
    'contained-indicator-color-secondary'  : Color.OnSecondaryContainer,

    'uncontained-indicator-color-tertiary': Color.Tertiary,
    'contained-container-color-tertiary'  : Color.TertiaryContainer,
    'contained-indicator-color-tertiary'  : Color.OnTertiaryContainer,

    'uncontained-indicator-color-error': Color.Error,
    'contained-container-color-error'  : Color.ErrorContainer,
    'contained-indicator-color-error'  : Color.OnErrorContainer,

    'uncontained-indicator-color-surface': Color.OnSurface,
    'contained-container-color-surface'  : Color.SurfaceContainer,
    'contained-indicator-color-surface'  : Color.OnSurface,
})
