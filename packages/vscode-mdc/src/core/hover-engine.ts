/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { DefinitionMeta } from './types'
import { normalizePrivateToken, splitChildBridgeSuffix } from './stylesheet-analyzer'

/**
 * Generates rich hover documentation for a hovered token string.
 */
export function getHoverInfoForToken(
    definitionMeta: DefinitionMeta | null,
    tokenText: string
): string | null {
    if (!definitionMeta) return null

    const cleanToken = tokenText.replace(/^[var(]+/, '').replace(/[);]+$/, '').trim()

    // 1. Private token hover: `--_container-color` / `--_enabled-container-color`
    if (cleanToken.startsWith('--_')) {
        const rawKey = cleanToken.replace(/^--_/, '')
        const schemaStates = definitionMeta.schema?.flatStates ?? []
        const normalized = normalizePrivateToken(rawKey, definitionMeta.ownTokens, schemaStates)
        const meta = definitionMeta.ownTokens.get(normalized.cleanKey)
        if (!meta) return null

        const isStateful = meta.isTuple === true || meta.isRecord === true
        const stateNames = Array.isArray(meta.states) ? meta.states : []
        const statesList = isStateful
            ? `**${stateNames.length}-State Tuple**:\n` +
              stateNames.map((s) => `  • \`${s}\``).join('\n')
            : `**Static Value**: \`${meta.rawValue || ''}\``

        const lines = [
            `### 📦 MDC Component Token: \`${cleanToken}\``,
            `---`,
            `**Component**: \`${definitionMeta.name}\``,
            statesList,
            `\n**Raw Definition**:`,
            `\`\`\`typescript\n${meta.rawValue || ''}\n\`\`\``,
        ]
        if (normalized.matchedState) {
            lines.push(`\n**State**: \`${normalized.matchedState}\` (of \`${normalized.cleanKey}\`)`)
        }
        return lines.join('\n')
    }

    // 2. Child bridge token hover: `--mdc-icon-enabled-color` / `--mdc-icon-size`
    if (cleanToken.startsWith('--mdc-') || cleanToken.startsWith('--md-')) {
        for (const [targetName, fwd] of definitionMeta.forwarded) {
            if (cleanToken.startsWith(fwd.targetPrefix)) {
                const suffix = cleanToken.replace(fwd.targetPrefix + '-', '')
                const split = splitChildBridgeSuffix(suffix, fwd.tokens)
                const lines = [
                    `### 🔗 Forwarded Child Token: \`${cleanToken}\``,
                    `---`,
                    `**Target Component**: \`${targetName}\``,
                    `**Parent Definition**: \`${definitionMeta.name}\``,
                    `**Target Prefix**: \`${fwd.targetPrefix}\``,
                    `**Child Token Key**: \`${split.key}\``,
                ]
                if (split.state) {
                    lines.push(`**State**: \`${split.state}\``)
                }
                return lines.join('\n')
            }
        }
    }

    return null
}

/**
 * Generates rich hover documentation for MDC at-rules.
 */
export function getHoverInfoForAtRule(atRuleName: string): string | null {
    const cleanName = atRuleName.startsWith('@') ? atRuleName : `@${atRuleName}`

    switch (cleanName) {
        case '@state':
            return [
                `### 📐 MDC At-Rule: \`@state(target) selector\``,
                `---`,
                `Scopes and expands interactive component state matrices over target elements.`,
                ``,
                `- **Rule R1**: Requires explicit \`target\` and \`selector\` parameters.`,
                `- **Rule R7**: Retains \`&\` prefix combinators (e.g. \`& button\` ➔ \`& button.small\`).`,
                `- **Rule R8**: Target must match within selector.`,
                `- **Cartesian Combinations**: Generates multi-dimensional state product rules.`,
            ].join('\n')

        case '@when':
            return [
                `### 📐 MDC At-Rule: \`@when(condition)\``,
                `---`,
                `Conditional state rule hoisted to the nearest host container boundary.`,
                ``,
                `- **Rule W1**: Condition must be mounted on \`:host\` (e.g. \`@when(:host([checked]))\`).`,
                `- **Rule W3**: Retains relative \`&\` combinators in ancestor paths (e.g. \`& .inner\`).`,
                `- **Rule W5**: Nested \`@when\` blocks are illegal and discarded.`,
            ].join('\n')

        case '@variant':
            return [
                `### 📐 MDC At-Rule: \`@variant(name)\``,
                `---`,
                `Scopes styling declarations to specific component visual variants.`,
                ``,
                `- **Rules V1–V3**: Exact variant dictionary key match.`,
                `- **Rule V4**: Nested \`@variant\` blocks are illegal and discarded.`,
            ].join('\n')

        default:
            return null
    }
}
