/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IAttachable } from '../../utils'

export interface IRipple extends LitElement, IAttachable {
    hovered: boolean
    focused: boolean
    pressed: boolean
    disabled: boolean
    ignoreGlobalConfig: boolean
    disableHoverStateLayer: boolean
    disableFocusStateLayer: boolean
    disablePressStateLayer: boolean
    hoverStateLayerElement: HTMLElement
    focusStateLayerElement: HTMLElement
    pressStateLayerElement: HTMLElement
}
