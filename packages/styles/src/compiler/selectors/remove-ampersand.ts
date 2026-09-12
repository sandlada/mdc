/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { splitSelectorByComma } from './compose-state-selector'

export const removeAmpersandForHostSubtree = (selector: string): string => {
    const branches = splitSelectorByComma(selector)
    return branches.map((b) => {
        const trimmed = b.trim()
        if (trimmed === '&') return ''
        return trimmed
    }).filter(Boolean).join(', ')
}
