/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

export const NavigationBarDefinition = createStyleDefinition({
    // Peek mode: visible sliver size when the bar is mostly docked outside the
    // viewport. Overridable via the `peek-size` attribute (px) on the host.
    'peek-size': `24px`,

    'vertical-container-height'               : `64px`,
    'vertical-container-inline-leading-space' : `0px`,
    'vertical-container-inline-trailing-space': `0px`,
    'vertical-container-block-leading-space'  : `0px`,
    'vertical-container-block-trailing-space' : `0px`,
    'vertical-tab-between-space'              : `0px`,
    'vertical-container-color'                : Color.SurfaceContainer,

    'horizontal-container-height'               : `64px`,
    'horizontal-container-inline-leading-space' : `20px`,
    'horizontal-container-inline-trailing-space': `20px`,
    'horizontal-container-block-leading-space'  : `0px`,
    'horizontal-container-block-trailing-space' : `0px`,
    'horizontal-tab-between-space'              : `0px`,
    'horizontal-container-color'                : Color.SurfaceContainer,

    'vertical-xr-container-height'               : `80px`,
    'vertical-xr-container-inline-leading-space' : `8px`,
    'vertical-xr-container-inline-trailing-space': `8px`,
    'vertical-xr-container-block-leading-space'  : `0px`,
    'vertical-xr-container-block-trailing-space' : `0px`,
    'vertical-xr-tab-between-space'              : `0px`,
    'vertical-xr-container-color'                : Color.SurfaceContainer,

    'vertical-container-shape-start-start': Shape.None,
    'vertical-container-shape-start-end': Shape.None,
    'vertical-container-shape-end-start': Shape.None,
    'vertical-container-shape-end-end': Shape.None,
    'vertical-xr-container-shape-start-start': Shape.Full,
    'vertical-xr-container-shape-start-end': Shape.Full,
    'vertical-xr-container-shape-end-start': Shape.Full,
    'vertical-xr-container-shape-end-end': Shape.Full,
    'horizontal-container-shape-start-start': Shape.None,
    'horizontal-container-shape-start-end': Shape.None,
    'horizontal-container-shape-end-start': Shape.None,
    'horizontal-container-shape-end-end': Shape.None,
})
