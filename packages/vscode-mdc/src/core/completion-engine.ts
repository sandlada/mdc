/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { DefinitionMeta } from './types'

export interface MDCCompletionItem {
    label: string
    insertText: string
    detail: string
    documentation?: string
    kind: 'variable' | 'property' | 'component'
}

/**
 * Generates context-scoped completion items for the current stylesheet.
 */
export function getContextScopedCompletions(
    definitionMeta: DefinitionMeta | null,
    currentPrefix: string
): MDCCompletionItem[] {
    if (!definitionMeta) return []

    const items: MDCCompletionItem[] = []
    const prefix = currentPrefix.trim()

    const wantsPrivate = prefix.startsWith('var(--_') || prefix.startsWith('--_') || prefix === 'var('
    const wantsChild = prefix.startsWith('--mdc-') || prefix.startsWith('--md-') || prefix.startsWith('--')

    // 1. Suggest Private Tokens (`--_token`)
    if (wantsPrivate || (!wantsChild && prefix === '')) {
        for (const [key, meta] of definitionMeta.ownTokens) {
            const varName = `--_${key}`
            const fullVarExpr = `var(${varName})`

            const tokenStates = Array.isArray(meta.states) ? meta.states : []
            const stateInfo = meta.isTuple || meta.isRecord
                ? `${tokenStates.length}-state tuple: ${tokenStates.join(', ') || 'all'}`
                : `static: ${meta.rawValue || ''}`

            items.push({
                label: varName,
                insertText: prefix.startsWith('var(') ? varName : fullVarExpr,
                detail: `📦 [${definitionMeta.name}] ${stateInfo}`,
                documentation: `Private host token for ${definitionMeta.name}.\n\nRaw definition: \`${meta.rawValue || ''}\``,
                kind: 'variable',
            })
        }
    }

    // 2. Suggest Forwarded Child Tokens (`--mdc-icon-*`)
    if (wantsChild || (!wantsPrivate && prefix === '')) {
        for (const [targetName, fwd] of definitionMeta.forwarded) {
            for (const [tokenKey, tokenMeta] of Object.entries(fwd.tokens)) {
                // If token is stateful in target
                const cleanKey = tokenKey.replace(/^--/, '')
                if (tokenMeta.isTuple || tokenMeta.isRecord) {
                    const childStates = Array.isArray(tokenMeta.states) && tokenMeta.states.length > 0
                        ? tokenMeta.states
                        : ['enabled']
                    for (const state of childStates) {
                        const targetVar = `${fwd.targetPrefix}-${state}-${cleanKey}`
                        items.push({
                            label: targetVar,
                            insertText: targetVar,
                            detail: `🔗 [Forwarded: ${targetName}] state: ${state}`,
                            documentation: `Public override variable targeting child component \`${targetName}\`.\n\nNamespace: \`${fwd.namespace}\``,
                            kind: 'property',
                        })
                    }
                } else {
                    const targetVar = `${fwd.targetPrefix}-${cleanKey}`
                    items.push({
                        label: targetVar,
                        insertText: targetVar,
                        detail: `🔗 [Forwarded: ${targetName}] static`,
                        documentation: `Public override variable targeting child component \`${targetName}\`.\n\nNamespace: \`${fwd.namespace}\``,
                        kind: 'property',
                    })
                }
            }
        }
    }

    return items
}
