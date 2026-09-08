/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Merges hoisted rules that share the exact same shell selector.
 */
export const mergeHoistedRules = (rules: readonly string[]): string[] => {
    const map = new Map<string, string[]>()
    const order: string[] = []

    for (const rule of rules) {
        const trimmed = rule.trim()
        if (!trimmed) continue

        const openIdx = trimmed.indexOf('{')
        const closeIdx = trimmed.lastIndexOf('}')
        if (openIdx !== -1 && closeIdx !== -1 && closeIdx > openIdx) {
            const sel = trimmed.slice(0, openIdx).trim()
            const body = trimmed.slice(openIdx + 1, closeIdx).trim()
            if (!map.has(sel)) {
                map.set(sel, [])
                order.push(sel)
            }
            if (body) {
                map.get(sel)!.push(body)
            }
        } else {
            order.push(trimmed)
            map.set(trimmed, [])
        }
    }

    return order.map((sel) => {
        const bodies = map.get(sel)
        if (!bodies || bodies.length === 0) {
            return `${sel} {}`
        }
        return `${sel} { ${bodies.join(' ')} }`
    })
}
