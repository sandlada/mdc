/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export function createDefaultTriggers(): Map<string, string> {
    const defaults = new Map<string, string>()

    defaults.set('enabled', '')
    defaults.set('hover', ':hover')
    defaults.set('hovered', ':hover')
    defaults.set('focus', ':focus-visible')
    defaults.set('focused', ':focus-visible')
    defaults.set('focus-visible', ':focus-visible')
    defaults.set('active', ':active')
    defaults.set('pressed', ':active')
    defaults.set('checked', '[checked]')
    defaults.set('indeterminate', '[indeterminate]')
    defaults.set('selected', '[selected]')
    defaults.set('disabled', '[disabled]')

    return defaults
}
