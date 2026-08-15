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
 * | `container-shape-*`| `ContainerShape`                  | `CornerFull` |
 *
 * Appearance mode (selected via the `contained` attribute):
 *
 * | mode          | container background                    | indicator color                    |
 * | ------------- | --------------------------------------- | ---------------------------------- |
 * | uncontained   | `enabled-uncontained-container-color`   | `enabled-uncontained-indicator-color` |
 * | contained     | `enabled-contained-container-color`     | `enabled-contained-indicator-color`   |
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
    'container-shape-start-start': Shape.Full,
    'container-shape-start-end'  : Shape.Full,
    'container-shape-end-start'  : Shape.Full,
    'container-shape-end-end'    : Shape.Full,

    'enabled-uncontained-container-color': 'transparent',
    'enabled-uncontained-indicator-color': Color.Primary,
    'enabled-contained-container-color'  : Color.PrimaryContainer,
    'enabled-contained-indicator-color'  : Color.OnPrimaryContainer,

    'enabled-uncontained-indicator-color-secondary': Color.Secondary,
    'enabled-contained-container-color-secondary'  : Color.SecondaryContainer,
    'enabled-contained-indicator-color-secondary'  : Color.OnSecondaryContainer,

    'enabled-uncontained-indicator-color-tertiary': Color.Tertiary,
    'enabled-contained-container-color-tertiary'  : Color.TertiaryContainer,
    'enabled-contained-indicator-color-tertiary'  : Color.OnTertiaryContainer,

    'enabled-uncontained-indicator-color-error': Color.Error,
    'enabled-contained-container-color-error'  : Color.ErrorContainer,
    'enabled-contained-indicator-color-error'  : Color.OnErrorContainer,

    'enabled-uncontained-indicator-color-surface': Color.OnSurface,
    'enabled-contained-container-color-surface'  : Color.SurfaceContainer,
    'enabled-contained-indicator-color-surface'  : Color.OnSurface,
})
