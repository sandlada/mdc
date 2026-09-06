/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IAttachable } from '../../utils/controller'

export interface IMDCRippleAttributes {
    hovered                : boolean
    focused                : boolean
    pressed                : boolean
    disabled               : boolean
    ignoreGlobalConfig     : boolean
    disableHoverStateLayer : boolean
    disableFocusStateLayer : boolean
    disablePressStateLayer : boolean
}

export interface IMDCRippleEvents { }

export interface IMDCRipple extends LitElement, IMDCRippleAttributes, IAttachable {
    readonly hoverStateLayerElement: HTMLElement
    readonly focusStateLayerElement: HTMLElement
    readonly pressStateLayerElement: HTMLElement
}
