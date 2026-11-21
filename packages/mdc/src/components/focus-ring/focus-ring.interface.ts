/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { IAttachable } from '../../utils/attachment'

export interface IFocusRing extends LitElement, IAttachable {
    focused     : boolean
    inward      : boolean
    animationDisabled: boolean
    disabled    : boolean
    ignoreGlobalConfig: boolean
    shapeInherit: boolean
    persistent  : boolean
    close(): void
}

