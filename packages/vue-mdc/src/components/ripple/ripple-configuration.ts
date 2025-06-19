
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @link
 * https://github.com/material-components/material-web/blob/main/ripple/internal/ripple.ts
 *
 * [Modified by Sandlada & Kai Orion]
 *
 * @license
 * Copyright 2025 Sandlada & Kai Orion
 * SPDX-License-Identifier: MIT
 */

export class RippleConfiguration {
    public static readonly pressGrowMs = 550
    public static readonly minimumPressMs = 250
    public static readonly initialOriginScale = 0.2
    public static readonly padding = 10
    public static readonly softEdgeMinimumSize = 75
    public static readonly softEdgeContainerRadio = 0.35
    public static readonly pressPseudo = '::after'
    public static readonly animationFill = 'forwards' as FillMode
    public static readonly touchDelayMs = 150
}
