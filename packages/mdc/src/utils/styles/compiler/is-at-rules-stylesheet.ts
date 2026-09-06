/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Checks whether the stylesheet uses unambiguous At-Rules syntax that definitely
 * belongs to the new style engine (independent of options.onWarn).
 */
export const hasDefiniteAtRules = (css: string): boolean => {
    if (css.includes('@anchor') || css.includes('@size')) return false
    return (
        css.includes('@state') ||
        css.includes('@when') ||
        css.includes('@reduced-motion') ||
        css.includes('@forced-colors') ||
        css.includes('@contrast') ||
        css.includes('@reduced-transparency') ||
        /\b(shape|typescale)\s*:/i.test(css) ||
        /\b(padding|margin)\s*:\s*(var\(|[^;{}]+[\s\n]+[^;{}]+;)/i.test(css)
    )
}

/**
 * Checks whether the stylesheet uses the new At-Rules syntax.
 */
export const isAtRulesStylesheet = (css: string): boolean => {
    if (css.includes('@size')) return false
    return (
        hasDefiniteAtRules(css) ||
        (css.includes('@variant') && !css.includes('*') && !css.includes('!') && !css.includes('@starting-style') && /\{\s*[^{}]*\{\s*\}/.test(css))
    )
}
