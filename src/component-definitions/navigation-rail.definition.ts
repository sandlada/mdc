/**
 * @license
 * Copyright 2025 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { Shape } from '@sandlada/mdk'
import { Color } from '../utils/tokens/theme'
import { createStyleDefinition } from '../utils/tokens/create-style-definition'

const collapsed = createStyleDefinition({
    'collapsed-container-width'                : `96px`,
    'collapsed-container-color'                : `transparent`,
    'collapsed-container-block-leading-space'  : `44px`,
    'collapsed-container-block-trailing-space' : `56px`,
    'collapsed-container-inline-leading-space' : `0px`,
    'collapsed-container-inline-trailing-space': `0px`,
    'collapsed-menu-fab-between-space'         : `4px`,
    'collapsed-segments-block-leading-space'   : `40px`,
    'collapsed-segments-block-trailing-space'  : `0px`,
    'collapsed-segments-inline-leading-space'  : `0px`,
    'collapsed-segments-inline-trailing-space' : `0px`,
    'collapsed-segments-between-space'         : `4px`,
    'collapsed-container-shape-start-start': Shape.None,
    'collapsed-container-shape-start-end': Shape.None,
    'collapsed-container-shape-end-start': Shape.None,
    'collapsed-container-shape-end-end': Shape.None,
})

/**
 *
 * |--------------------------|
 * |                          |
 * |   IconButton             |
 * |   Fab                    |
 * |                          |
 * |   |------------------|   |
 * |   | Segments         |   |
 * |   |   Label-1        |   |
 * |   |   Label-2        |   |
 * |   |                  |   |
 * |   |   SectionHeader1 |   |
 * |   |                  |   |
 * |___|__________________|___|
 *     |   SectionHeader2 |
 *     |   Label          |
 *     |------------------|
 */
const expanded = createStyleDefinition({
    'expanded-container-width-minimum'        : `220px`,
    'expanded-docked-container-color'         : `transparent`,
    'expanded-floating-container-color'       : Color.SurfaceContainer,
    'expanded-container-block-leading-space'  : `44px`,
    'expanded-container-block-trailing-space' : `20px`,
    'expanded-container-inline-leading-space' : `20px`,
    'expanded-container-inline-trailing-space': `20px`,
    'expanded-menu-fab-between-space'         : `4px`,
    'expanded-segments-block-leading-space'   : `40px`,
    'expanded-segments-block-trailing-space'  : `0px`,
    'expanded-segments-inline-leading-space'  : `0px`,
    'expanded-segments-inline-trailing-space' : `0px`,
    'expanded-segments-between-space'         : `0px`,
    'expanded-section-between-space'          : `12px`,
    'expanded-container-shape-start-start': Shape.None,
    'expanded-container-shape-start-end': Shape.None,
    'expanded-container-shape-end-start': Shape.None,
    'expanded-container-shape-end-end': Shape.None,
})

export const NavigationRailDefinition = {
    ...collapsed,
    ...expanded,
} as const
