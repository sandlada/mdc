import { Color, Shape } from '@sandlada/mdk'
import { createLogicShapeTokens } from '../utils'

export const NavigationBarDefinition = {
    'vertical-container-height'               : `64px`,
    'vertical-container-inline-leading-space' : `0px`,
    'vertical-container-inline-trailing-space': `0px`,
    'vertical-container-block-leading-space'  : `0px`,
    'vertical-container-block-trailing-space' : `0px`,
    'vertical-tab-between-space'              : `0px`,
    'vertical-container-color'                : Color.SurfaceContainer,

    'horizonal-container-height'               : `64px`,
    'horizonal-container-inline-leading-space' : `20px`,
    'horizonal-container-inline-trailing-space': `20px`,
    'horizonal-container-block-leading-space'  : `0px`,
    'horizonal-container-block-trailing-space' : `0px`,
    'horizonal-tab-between-space'              : `0px`,
    'horizonal-container-color'                : Color.SurfaceContainer,

    'vertical-xr-container-height'               : `80px`,
    'vertical-xr-container-inline-leading-space' : `8px`,
    'vertical-xr-container-inline-trailing-space': `8px`,
    'vertical-xr-container-block-leading-space'  : `0px`,
    'vertical-xr-container-block-trailing-space' : `0px`,
    'vertical-xr-tab-between-space'              : `0px`,
    'vertical-xr-container-color'                : Color.SurfaceContainer,

    ...createLogicShapeTokens('--mdc-navigation-bar', {
        'vertical-container-shape'   : Shape.None,
        'vertical-xr-container-shape': Shape.Full,
        'horizonal-container-shape'  : Shape.None,
    }, 'all', false)
} as const
