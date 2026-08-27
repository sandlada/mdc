/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { StylesheetAnalysis, DefinitionMeta, DiagnosticIssue } from './types'

/**
 * Analyzes a stylesheet and returns all MDC diagnostic issues (MDC001, MDC002, MDC003).
 */
export function getStylesheetDiagnostics(
    analysis: StylesheetAnalysis,
    defMeta: DefinitionMeta | null
): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []

    for (const usage of analysis.allUsages) {
        // Rule MDC001: Hardcoded fallback check
        if (usage.fallback) {
            issues.push({
                code: 'MDC001',
                message: `[MDC001] Handcrafted fallback "${usage.fallback}" in var(${usage.token}) violates MDC design token SSOT architecture. Fallback values must originate exclusively from ${analysis.definitionName}.`,
                severity: 'warning',
                range: usage.range,
                token: usage.token,
                quickFix: {
                    title: `Remove hardcoded fallback "${usage.fallback}"`,
                    replacement: `var(${usage.token})`,
                    range: usage.range,
                },
            })
        }

        // Rule MDC002: Ghost token check (undefined in Definition)
        if (usage.token.startsWith('--_') && defMeta) {
            const isDefined = defMeta.ownTokens.has(usage.cleanKey)
            if (!isDefined) {
                issues.push({
                    code: 'MDC002',
                    message: `[MDC002] Unknown token "${usage.token}" is not declared in ${analysis.definitionName}.`,
                    severity: 'error',
                    range: usage.range,
                    token: usage.token,
                })
            }
        }

        // Rule MDC003: Invalid child state assignment check
        if (usage.token.startsWith('--mdc-') && defMeta) {
            for (const [targetName, fwd] of defMeta.forwarded) {
                if (usage.token.startsWith(fwd.targetPrefix)) {
                    const suffix = usage.token.replace(fwd.targetPrefix + '-', '')
                    // Suffix is like `hovered-color` or `enabled-color`
                    const stateMatch = /^(enabled|hovered|pressed|focused|disabled)-(.*)$/.exec(suffix)
                    if (stateMatch) {
                        const state = stateMatch[1]
                        const tokenKey = stateMatch[2]
                        const fwdMeta = fwd.tokens[tokenKey]

                        if (fwdMeta && !fwdMeta.isTuple && state !== 'enabled') {
                            issues.push({
                                code: 'MDC003',
                                message: `[MDC003] Target component "${targetName}" only defines "enabled" state for "${tokenKey}". Override "${fwd.targetPrefix}-enabled-${tokenKey}" inside a state pseudo-class (:hover, :active) instead.`,
                                severity: 'warning',
                                range: usage.range,
                                token: usage.token,
                                quickFix: {
                                    title: `Change to "${fwd.targetPrefix}-enabled-${tokenKey}"`,
                                    replacement: `${fwd.targetPrefix}-enabled-${tokenKey}`,
                                    range: usage.range,
                                },
                            })
                        }
                    }
                }
            }
        }
    }

    return issues
}
