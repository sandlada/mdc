/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { StylesheetAnalysis, DefinitionMeta, DiagnosticIssue } from './types'
import { splitChildBridgeSuffix } from './stylesheet-analyzer'
import { isHostMountedSelector, replaceTargetInSelector } from '@sandlada/styles/compiler'

/**
 * Analyzes a stylesheet and returns all MDC diagnostic issues (MDC001 - MDC007).
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

    // At-Rules Diagnostics (MDC004, MDC005, MDC006, MDC007)
    if (analysis.atRules) {
        for (const atRule of analysis.atRules) {
            // Rule MDC004: Nested @variant check (Rule V4) or empty variant list
            if (atRule.type === 'variant') {
                if (atRule.isNested) {
                    issues.push({
                        code: 'MDC004',
                        message: `[MDC004] Nested @variant at-rules are not supported (Rule V4). The nested block is rejected and discarded.`,
                        severity: 'warning',
                        range: atRule.range,
                        token: atRule.header || '@variant',
                    })
                } else if (!atRule.param || atRule.param.trim().length === 0) {
                    issues.push({
                        code: 'MDC004',
                        message: `[MDC004] Invalid @variant syntax: "${atRule.header}". Variant name list is required (Rule V1). The block is rejected and discarded.`,
                        severity: 'warning',
                        range: atRule.range,
                        token: atRule.header || '@variant',
                    })
                }
            }

            // Rule MDC005: Nested @when check (Rule W5)
            if (atRule.type === 'when' && atRule.isNested) {
                issues.push({
                    code: 'MDC005',
                    message: `[MDC005] Nested @when at-rules are not supported (Rule W5). The nested block is rejected and discarded.`,
                    severity: 'warning',
                    range: atRule.range,
                    token: atRule.header || '@when',
                })
            }

            // Rule MDC006: Non-host condition in @when check (Rule W1)
            if (atRule.type === 'when' && !atRule.isNested) {
                if (!atRule.param || atRule.param.trim().length === 0) {
                    issues.push({
                        code: 'MDC006',
                        message: `[MDC006] Invalid @when syntax: condition is required and must be mounted on :host (Rule W1). The condition is rejected and discarded.`,
                        severity: 'warning',
                        range: atRule.range,
                        token: atRule.header || '@when',
                    })
                } else if (!isHostMountedSelector(atRule.param)) {
                    issues.push({
                        code: 'MDC006',
                        message: `[MDC006] @when condition "${atRule.param}" must be mounted on :host (Rule W1). The condition is rejected and discarded.`,
                        severity: 'warning',
                        range: atRule.range,
                        token: atRule.header || '@when',
                    })
                }
            }

            // Rule MDC007: Invalid @state target / syntax check (Rules R1, R8)
            if (atRule.type === 'state') {
                if (!atRule.param || !atRule.selector) {
                    issues.push({
                        code: 'MDC007',
                        message: `[MDC007] Invalid @state syntax: "${atRule.header}". Target and selector are both required (Rule R1).`,
                        severity: 'error',
                        range: atRule.range,
                        token: atRule.header || '@state',
                    })
                } else {
                    const check = replaceTargetInSelector(atRule.selector, atRule.param, '')
                    if (!check.matched) {
                        issues.push({
                            code: 'MDC007',
                            message: `[MDC007] Selector "${atRule.selector}" does not contain target "${atRule.param}" (Rule R8). The block is rejected and discarded.`,
                            severity: 'warning',
                            range: atRule.range,
                            token: atRule.header || '@state',
                        })
                    }
                }
            }
        }
    }

    return issues
}
