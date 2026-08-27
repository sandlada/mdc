/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { DefinitionMeta } from './types'

/**
 * Generates rich hover documentation for a hovered token string.
 */
export function getHoverInfoForToken(
    definitionMeta: DefinitionMeta | null,
    tokenText: string
): string | null {
    if (!definitionMeta) return null

    const cleanToken = tokenText.replace(/^[var(]+/, '').replace(/[);]+$/, '').trim()

    // 1. Private token hover: `--_container-color`
    if (cleanToken.startsWith('--_')) {
        const key = cleanToken.replace(/^--_/, '')
        const meta = definitionMeta.ownTokens.get(key)
        if (!meta) return null

        const statesList = meta.isTuple
            ? `**5-State Tuple**:\n` +
              (meta.states || []).map((s) => `  • \`${s}\``).join('\n')
            : `**Static Value**: \`${meta.rawValue || ''}\``

        return [
            `### 📦 MDC Component Token: \`${cleanToken}\``,
            `---`,
            `**Component**: \`${definitionMeta.name}\``,
            statesList,
            `\n**Raw Definition**:`,
            `\`\`\`typescript\n${meta.rawValue || ''}\n\`\`\``,
        ].join('\n')
    }

    // 2. Child bridge token hover: `--mdc-icon-enabled-color`
    if (cleanToken.startsWith('--mdc-') || cleanToken.startsWith('--md-')) {
        for (const [targetName, fwd] of definitionMeta.forwarded) {
            if (cleanToken.startsWith(fwd.targetPrefix)) {
                const subKey = cleanToken.replace(fwd.targetPrefix + '-', '')
                return [
                    `### 🔗 Forwarded Child Token: \`${cleanToken}\``,
                    `---`,
                    `**Target Component**: \`${targetName}\``,
                    `**Parent Definition**: \`${definitionMeta.name}\``,
                    `**Target Prefix**: \`${fwd.targetPrefix}\``,
                    `**Child Token Key**: \`${subKey}\``,
                ].join('\n')
            }
        }
    }

    return null
}
