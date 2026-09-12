/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

/**
 * Expands a11y macros into standard media query blocks.
 */
export const expandA11yPresets = (css: string): string => {
    return css
        .replace(/@reduced-motion\b/g, '@media (prefers-reduced-motion: reduce)')
        .replace(/@forced-colors\b/g, '@media (forced-colors: active)')
        .replace(/@contrast-more\b/g, '@media (prefers-contrast: more)')
        .replace(/@contrast-less\b/g, '@media (prefers-contrast: less)')
        .replace(/@reduced-transparency\b/g, '@media (prefers-reduced-transparency: reduce)')
}
