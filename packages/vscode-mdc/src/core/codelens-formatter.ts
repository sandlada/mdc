/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { StylesheetAnalysis } from './types'

export interface CodeLensItem {
    title: string
    command?: {
        title: string
        command: string
        arguments?: any[]
    }
}

/**
 * Formats CodeLens items for the top-level style export declaration line.
 * (e.g. `export const NavigationTabStyles = [`)
 */
export function formatStyleExportCodeLens(
    analysis: StylesheetAnalysis,
    referenceCount: number = 0
): CodeLensItem[] {
    return [
        {
            title: `📌 ${referenceCount} references`,
            command: {
                title: `📌 ${referenceCount} references`,
                command: 'editor.action.showReferences',
            },
        },
        {
            title: `⚡ View Compiled CSS`,
            command: {
                title: `⚡ View Compiled CSS`,
                command: 'mdc.showCompiledCss',
            },
        },
    ]
}

/**
 * Formats CodeLens items for the createStyleSheet(...) declaration line.
 */
export function formatCreateStyleSheetCodeLens(
    analysis: StylesheetAnalysis
): CodeLensItem[] {
    const items: CodeLensItem[] = []

    const usedCount = analysis.usedPrivateTokens.length
    const totalCount = analysis.totalDefinitionTokens || usedCount
    const percent = analysis.coveragePercent
    const defName = analysis.definitionName || 'Unknown'

    // 1. Definition & Coverage Pill
    items.push({
        title: `📦 ${defName} (${usedCount}/${totalCount} - ${percent}%)`,
        command: {
            title: `📦 Definition: ${defName}`,
            command: 'mdc.inspectTokens',
            arguments: [analysis, 'all'],
        },
    })

    // 2. Private Tokens Pill
    if (analysis.usedPrivateTokens.length > 0) {
        items.push({
            title: `🎨 ${analysis.usedPrivateTokens.length} Private Tokens`,
            command: {
                title: `🎨 Used Private Tokens`,
                command: 'mdc.inspectTokens',
                arguments: [analysis, 'private'],
            },
        })
    }

    // 3. Child Bridge Tokens Pill
    if (analysis.usedChildBridgeTokens.length > 0) {
        items.push({
            title: `🔗 ${analysis.usedChildBridgeTokens.length} Child Tokens`,
            command: {
                title: `🔗 Used Child Bridge Tokens`,
                command: 'mdc.inspectTokens',
                arguments: [analysis, 'child'],
            },
        })
    }

    // 4. Unused Tokens Pill
    if (analysis.unusedTokens.length > 0) {
        items.push({
            title: `⚠️ ${analysis.unusedTokens.length} Unused`,
            command: {
                title: `⚠️ Unused Tokens in Definition`,
                command: 'mdc.inspectTokens',
                arguments: [analysis, 'unused'],
            },
        })
    } else {
        items.push({
            title: `✅ 0 Unused`,
            command: {
                title: `✅ All Definition Tokens Used`,
                command: 'mdc.inspectTokens',
                arguments: [analysis, 'all'],
            },
        })
    }

    return items
}

/**
 * Formats a CodeLens item for defineTokenRefsRecord / defineComponentTokenRefs lines.
 */
export function formatTokenRecordCodeLens(
    definitionName: string,
    prefix?: string
): CodeLensItem {
    const title = prefix
        ? `📦 Token Record: ${definitionName} (${prefix})`
        : `📦 Token Record: ${definitionName}`
    return {
        title,
        command: {
            title,
            command: 'mdc.inspectTokens',
        },
    }
}

/**
 * Formats a CodeLens item for overrideStyleSheet / overrideComponentTokens lines.
 */
export function formatOverrideCodeLens(
    targetName: string,
    prefix?: string
): CodeLensItem {
    const title = prefix
        ? `🔗 Override: ${targetName} (${prefix})`
        : `🔗 Override: ${targetName}`
    return {
        title,
        command: {
            title,
            command: 'mdc.inspectTokens',
        },
    }
}

/**
 * Formats CodeLens items for *.definition.ts declarations.
 */
export function formatDefinitionCodeLens(
    name: string,
    ownTokenCount: number,
    forwardedCount: number,
    referenceCount: number = 0
): CodeLensItem[] {
    const fwdText = forwardedCount > 0 ? `, ${forwardedCount} Forwarded` : ''
    return [
        {
            title: `📦 ${name} (${ownTokenCount} Tokens${fwdText})`,
            command: {
                title: `📦 ${name}`,
                command: 'editor.action.showReferences',
            },
        },
        {
            title: `📌 ${referenceCount} references`,
            command: {
                title: `📌 ${referenceCount} references`,
                command: 'editor.action.showReferences',
            },
        },
    ]
}

/**
 * Formats modular, clean, and clickable CodeLens items for VS Code.
 * VS Code groups all CodeLenses on the same line horizontally, so we provide
 * compact high-level indicator pills with interactive drill-down commands.
 */
export function formatStylesheetCodeLens(
    analysis: StylesheetAnalysis,
    referenceCount: number = 0
): CodeLensItem[] {
    const items: CodeLensItem[] = []

    // 1. References Pill
    items.push({
        title: `📌 ${referenceCount} references`,
        command: {
            title: `📌 ${referenceCount} references`,
            command: 'editor.action.showReferences',
        },
    })

    // 2. Definition & Coverage Pill
    const usedCount = analysis.usedPrivateTokens.length
    const totalCount = analysis.totalDefinitionTokens || usedCount
    const percent = analysis.coveragePercent
    const defName = analysis.definitionName || 'Unknown'

    items.push({
        title: `📦 ${defName} (${usedCount}/${totalCount} - ${percent}%)`,
        command: {
            title: `📦 Definition: ${defName}`,
            command: 'mdc.inspectTokens',
            arguments: [analysis, 'all'],
        },
    })

    // 3. Private Tokens Pill
    if (analysis.usedPrivateTokens.length > 0) {
        items.push({
            title: `🎨 ${analysis.usedPrivateTokens.length} Private Tokens`,
            command: {
                title: `🎨 Used Private Tokens`,
                command: 'mdc.inspectTokens',
                arguments: [analysis, 'private'],
            },
        })
    }

    // 4. Child Bridge Tokens Pill
    if (analysis.usedChildBridgeTokens.length > 0) {
        items.push({
            title: `🔗 ${analysis.usedChildBridgeTokens.length} Child Tokens`,
            command: {
                title: `🔗 Used Child Bridge Tokens`,
                command: 'mdc.inspectTokens',
                arguments: [analysis, 'child'],
            },
        })
    }

    // 5. Unused Tokens Pill
    if (analysis.unusedTokens.length > 0) {
        items.push({
            title: `⚠️ ${analysis.unusedTokens.length} Unused`,
            command: {
                title: `⚠️ Unused Tokens in Definition`,
                command: 'mdc.inspectTokens',
                arguments: [analysis, 'unused'],
            },
        })
    } else {
        items.push({
            title: `✅ 0 Unused`,
            command: {
                title: `✅ All Definition Tokens Used`,
                command: 'mdc.inspectTokens',
                arguments: [analysis, 'all'],
            },
        })
    }

    // 6. View Compiled CSS Pill
    items.push({
        title: `⚡ View Compiled CSS`,
        command: {
            title: `⚡ View Compiled CSS`,
            command: 'mdc.showCompiledCss',
        },
    })

    return items
}

/**
 * Formats the full line-by-line text report (used in Hover and QuickPick).
 */
export function formatFullInspectionReport(
    analysis: StylesheetAnalysis,
    referenceCount: number = 0
): string {
    const lines: string[] = []

    const usedCount = analysis.usedPrivateTokens.length
    const totalCount = analysis.totalDefinitionTokens || usedCount
    const percent = analysis.coveragePercent

    lines.push(`## 📦 MDC Stylesheet Inspection: \`${analysis.styleVarName}\``)
    lines.push(`---`)
    lines.push(`- **References**: \`${referenceCount}\``)
    lines.push(`- **Component Definition**: \`${analysis.definitionName || 'Unknown'}\``)
    lines.push(`- **Token Coverage**: \`${usedCount} / ${totalCount} (${percent}%)\``)
    lines.push(``)

    // Private Tokens
    if (analysis.usedPrivateTokens.length > 0) {
        lines.push(`### 🎨 Used Private Tokens (${analysis.usedPrivateTokens.length}):`)
        for (const token of analysis.usedPrivateTokens) {
            const stateDesc = token.isTuple
                ? `\`${token.states.length} states: ${token.states.join(', ')}\``
                : `\`1 state: static ${token.rawValue || ''}\``.trim()
            lines.push(`- \`var(${token.token})\` — ${stateDesc}`)
        }
        lines.push(``)
    }

    // Child Bridge Tokens
    if (analysis.usedChildBridgeTokens.length > 0) {
        lines.push(`### 🔗 Used Child Bridge Tokens (${analysis.usedChildBridgeTokens.length}):`)
        for (const child of analysis.usedChildBridgeTokens) {
            lines.push(`- \`${child.token}\` ➔ Target: **${child.targetName}** (from \`${child.sourceVarName}\`)`)
        }
        lines.push(``)
    }

    // Unused Tokens
    if (analysis.unusedTokens.length > 0) {
        lines.push(`### ⚠️ Unused Tokens in Definition (${analysis.unusedTokens.length}):`)
        for (const token of analysis.unusedTokens) {
            lines.push(`- \`${token}\``)
        }
        lines.push(``)
    }

    return lines.join('\n')
}
