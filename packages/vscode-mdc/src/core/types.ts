/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

export interface SourceRange {
    startLine: number
    startCol: number
    endLine: number
    endCol: number
}

export interface TokenValueMeta {
    key: string
    isTuple: boolean
    states?: string[]
    rawValue?: string
    rawStates?: (string | null | undefined)[]
    range?: SourceRange
}

export interface ForwardedChildMeta {
    targetDefinitionName: string
    targetPrefix: string
    namespace: string
    tokens: Record<string, any>
    range?: SourceRange
}

export interface DefinitionMeta {
    name: string
    filePath?: string
    ownTokens: Map<string, TokenValueMeta>
    forwarded: Map<string, ForwardedChildMeta>
}

export interface TokenUsageLocation {
    token: string
    cleanKey: string
    range: SourceRange
    fullMatch: string
    fallback?: string
}

export interface UsedPrivateToken {
    token: string // e.g. '--_container-color'
    cleanKey: string // e.g. 'container-color'
    isTuple: boolean
    states: string[]
    rawValue?: string
    locations?: TokenUsageLocation[]
}

export interface UsedChildBridgeToken {
    token: string // e.g. '--mdc-icon-enabled-color'
    targetName: string // e.g. 'IconDefinition'
    targetPrefix: string // e.g. '--mdc-icon'
    sourceVarName: string // e.g. '--mdc-button-enabled-icon-color'
    fallbackValue?: string
    locations?: TokenUsageLocation[]
}

export interface TokenRecordDeclaration {
    line: number
    varName: string
    definitionName: string
    prefix?: string
}

export interface OverrideDeclaration {
    line: number
    targetName: string
    prefix: string
    props?: Record<string, string>
}

export interface StylesheetAnalysis {
    styleVarName: string // e.g. 'ButtonStyles'
    definitionName: string // e.g. 'ButtonDefinition'
    definitionNames?: string[] // all definitions involved (e.g. for array of definitions)
    definitionFilePath?: string
    declarationLine: number // 0-indexed line of `export const XxxStyles`
    createStyleSheetLine?: number // 0-indexed line of `createStyleSheet(...)`
    tokenRecords?: TokenRecordDeclaration[]
    overrides?: OverrideDeclaration[]
    usedPrivateTokens: UsedPrivateToken[]
    usedChildBridgeTokens: UsedChildBridgeToken[]
    unusedTokens: string[]
    totalDefinitionTokens: number
    coveragePercent: number
    rawCssText: string
    allUsages: TokenUsageLocation[]
}

export interface DiagnosticIssue {
    code: 'MDC001' | 'MDC002' | 'MDC003'
    message: string
    severity: 'error' | 'warning' | 'info'
    range: SourceRange
    token: string
    quickFix?: {
        title: string
        replacement: string
        range: SourceRange
    }
}
