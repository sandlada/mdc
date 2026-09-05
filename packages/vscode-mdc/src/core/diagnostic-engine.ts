/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { StylesheetAnalysis, DefinitionMeta, DiagnosticIssue } from './types'
import { splitChildBridgeSuffix } from './stylesheet-analyzer'

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

        // Rule MDC003: Invalid child state assignment check.
        // Static (state-invariant) child tokens have no state infix: the only
        // valid override is `${prefix}-${key}`. A state infix on a static token
        // (e.g. `--mdc-icon-hovered-size`) is always wrong.
        if (usage.token.startsWith('--mdc-') && defMeta) {
            for (const [targetName, fwd] of defMeta.forwarded) {
                if (usage.token.startsWith(fwd.targetPrefix)) {
                    const suffix = usage.token.replace(fwd.targetPrefix + '-', '')
                    const split = splitChildBridgeSuffix(suffix, fwd.tokens)
                    const fwdMeta = fwd.tokens[split.key]

                    if (fwdMeta && split.state && split.state !== 'enabled' && split.state !== 'base' && !fwdMeta.isTuple && !fwdMeta.isRecord) {
                        issues.push({
                            code: 'MDC003',
                            message: `[MDC003] Target component "${targetName}" defines "${split.key}" as a static token. Use "${fwd.targetPrefix}-${split.key}" (no state infix) instead of "${usage.token}".`,
                            severity: 'warning',
                            range: usage.range,
                            token: usage.token,
                            quickFix: {
                                title: `Change to "${fwd.targetPrefix}-${split.key}"`,
                                replacement: `${fwd.targetPrefix}-${split.key}`,
                                range: usage.range,
                            },
                        })
                    }
                }
            }
        }
    }

    return issues
}
