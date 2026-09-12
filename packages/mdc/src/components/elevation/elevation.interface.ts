/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'

export interface IMDCElevationAttributes {
    ignoreGlobalConfig: boolean
    disabled: boolean
}

export interface IMDCElevationEvents { }

export interface IMDCElevation extends LitElement, IMDCElevationAttributes { }
