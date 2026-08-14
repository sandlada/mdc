/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { LitElement } from 'lit'
import type { ITab } from './tab.interface'

export interface ITabs extends LitElement {
    activeTabIndex: number
    activeTab: ITab | null
    autoActivate: boolean
    scrollToTab(tabToScrollTo?: ITab | null): Promise<void>
}
