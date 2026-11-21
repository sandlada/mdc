/**
 * @version 2026.11.21
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Typescale } from '@sandlada/mdk'
import { Color } from '../../utils/color'
import { createStyleDefinition, expandPadding, expandTypescale } from '../../utils/style'

export const EmptyStateDefinition = createStyleDefinition({
    'container-max-inline-size': '28rem',
    ...expandPadding('container-padding')({ block: '32px', inline: '24px' }),
    'container-gap': '8px',
    'illustration-spacing': '8px',
    'illustration-icon-size': '32px',
    'actions-spacing': '16px',
    'actions-gap': '8px',
    'enabled-illustration-color': Color.Primary,
    'enabled-headline-color': Color.OnSurface,
    'enabled-supporting-text-color': Color.OnSurfaceVariant,
    ...expandTypescale('headline')(Typescale.TitleLarge),
    'headline-opacity': 1,
    ...expandTypescale('supporting-text')(Typescale.BodyMedium),
    'supporting-text-opacity': 1,
})
