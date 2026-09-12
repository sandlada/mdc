/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export interface IMDCDividerAttributes {
    inset: boolean
    insetStart: boolean
    insetEnd: boolean
}

export interface IMDCDividerEvents { }

export interface IMDCDivider extends LitElement, IMDCDividerAttributes { }
