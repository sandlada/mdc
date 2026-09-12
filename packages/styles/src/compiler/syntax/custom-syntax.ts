/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * Custom At-Rules Syntax Definition via csstree.fork().
 * Supports @when, @variant, and @state with formal preludes and fail-fast validation.
 */

import {
    fork,
    walk,
    List,
    tokenTypes,
    type Atrule,
    type CssNode,
    type Raw,
    type Selector,
    type SelectorList,
    type StyleSheet,
    type Syntax,
    type ParseOptions
} from '../internal/csstree'
import type { StyleDiagnosticWarning } from '../sheet'
import { splitSelectorByComma } from '../selectors'
import { isHostMountedSelector } from '../hoist'

const { LeftCurlyBracket, RightCurlyBracket, WhiteSpace, Comment, Semicolon, AtKeyword } = tokenTypes
const AMPERSAND = 0x0026

function consumeRaw(this: any) {
    return this.Raw(null, true)
}

function consumeRule(this: any) {
    return this.parseWithFallback(this.Rule, consumeRaw)
}

function consumeRawDeclaration(this: any, _startToken?: number) {
    return (this as any).Raw(this.consumeUntilSemicolonIncluded, true)
}

function consumeDeclaration(this: any) {
    if (this.tokenType === Semicolon) {
        return consumeRawDeclaration.call(this, this.tokenIndex)
    }

    const node = this.parseWithFallback(this.Declaration, consumeRawDeclaration)

    if (this.tokenType === Semicolon) {
        this.next()
    }

    return node
}

/**
 * Forked CSSTree syntax instance supporting @when, @variant, and @state.
 * Also preserves CSS comments inside blocks (F6 / BUG-02).
 */
export const styleSyntax: Syntax = fork({
    atrules: {
        when: {
            prelude: '<declaration-value>'
        },
        variant: {
            prelude: '<declaration-value>'
        },
        state: {
            prelude: '<declaration-value>'
        }
    },
    atrule: {
        when: {
            parse: {
                prelude(this: any) {
                    const children = this.createList()
                    children.push(this.Raw(this.consumeUntilLeftCurlyBracketOrSemicolon, true))
                    return children
                }
            }
        },
        variant: {
            parse: {
                prelude(this: any) {
                    const children = this.createList()
                    children.push(this.Raw(this.consumeUntilLeftCurlyBracketOrSemicolon, true))
                    return children
                }
            }
        },
        state: {
            parse: {
                prelude(this: any) {
                    const children = this.createList()
                    children.push(this.Raw(this.consumeUntilLeftCurlyBracketOrSemicolon, true))
                    return children
                }
            }
        }
    },
    node: {
        Block: {
            parse(this: any, isStyleBlock: boolean) {
                const consumer = isStyleBlock ? consumeDeclaration : consumeRule
                const start = this.tokenStart
                const children = this.createList()

                this.eat(LeftCurlyBracket)

                scan:
                while (!this.eof) {
                    switch (this.tokenType) {
                        case RightCurlyBracket:
                            break scan

                        case WhiteSpace:
                            this.next()
                            break

                        case Comment:
                            children.push(this.Comment())
                            break

                        case AtKeyword:
                            children.push(this.parseWithFallback(this.Atrule.bind(this, isStyleBlock), consumeRaw))
                            break

                        default:
                            if (isStyleBlock && this.isDelim(AMPERSAND)) {
                                children.push(consumeRule.call(this))
                            } else {
                                children.push(consumer.call(this))
                            }
                    }
                }

                if (!this.eof) {
                    this.eat(RightCurlyBracket)
                }

                return {
                    type: 'Block',
                    loc: this.getLocation(start, this.tokenStart),
                    children
                }
            }
        }
    }
} as any)

/**
 * Extracts raw text from an at-rule prelude whether it is Raw, AtrulePrelude, or string.
 */
export function getPreludeText(prelude: CssNode | string | null | undefined): string {
    if (!prelude) return ''
    if (typeof prelude === 'string') return prelude.trim()
    if (prelude.type === 'Raw') return (prelude as Raw).value.trim()
    if (prelude.type === 'AtrulePrelude') {
        if (prelude.children && !prelude.children.isEmpty) {
            const first = prelude.children.first
            if (first && first.type === 'Raw') {
                return (first as Raw).value.trim()
            }
        }
        return styleSyntax.generate(prelude).trim()
    }
    return styleSyntax.generate(prelude).trim()
}

/**
 * Parses a stylesheet with tolerant error recovery so malformed CSS does not crash.
 */
export function parseCustomStylesheet(css: string, options?: ParseOptions): StyleSheet {
    try {
        return styleSyntax.parse(css, {
            parseValue: true,
            onParseError() {},
            ...options
        }) as StyleSheet
    } catch {
        return {
            type: 'StyleSheet',
            loc: null,
            children: new List()
        } as unknown as StyleSheet
    }
}

/**
 * Strips C-style block comments (/* ... *\/) without touching double slashes (//) per BUG-02.
 */
function stripBlockComments(str: string): string {
    return str.replace(/\/\*[\s\S]*?\*\//g, '').trim()
}

export interface StatePreludeSuccess {
    readonly ok: true
    readonly valid: true
    readonly target: string
    readonly targetAst?: Selector
    readonly selector: string
    readonly selectorAst?: SelectorList
}

export interface StatePreludeFailure {
    readonly ok: false
    readonly valid: false
    readonly target?: undefined
    readonly targetAst?: undefined
    readonly selector?: undefined
    readonly selectorAst?: undefined
    readonly warning?: StyleDiagnosticWarning
}

export type StatePreludeResult = StatePreludeSuccess | StatePreludeFailure

export interface StatePreludeOptions {
    readonly onWarn?: (warning: StyleDiagnosticWarning) => void
}

/**
 * Validates and parses @state prelude (Rule R1).
 * Header format: (target) selector
 * If missing parens, empty target, or missing selector, emits invalid-state-syntax and drops block.
 */
export function parseStatePrelude(
    preludeInput: CssNode | string | null | undefined,
    optionsOrWarn?: StatePreludeOptions | ((warning: StyleDiagnosticWarning) => void)
): StatePreludeResult {
    const onWarn = typeof optionsOrWarn === 'function' ? optionsOrWarn : optionsOrWarn?.onWarn
    const rawText = typeof preludeInput === 'string' ? preludeInput.trim() : getPreludeText(preludeInput)
    const originalText = typeof preludeInput === 'string' ? preludeInput : rawText

    let text = rawText
    if (text.startsWith('@state')) {
        text = text.slice(6).trim()
    }

    if (!text.startsWith('(')) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-state-syntax',
            message: `Invalid @state syntax: "${originalText}". Target and selector are both required.`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    let depth = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let isEscaped = false
    let targetEndIdx = -1

    for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (isEscaped) {
            isEscaped = false
            continue
        }
        if (ch === '\\') {
            isEscaped = true
            continue
        }
        if (ch === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote
            continue
        }
        if (ch === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            continue
        }
        if (inSingleQuote || inDoubleQuote) {
            continue
        }
        if (ch === '(') {
            depth++
        } else if (ch === ')') {
            depth--
            if (depth === 0) {
                targetEndIdx = i
                break
            }
        }
    }

    if (depth !== 0 || targetEndIdx === -1) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-state-syntax',
            message: `Invalid @state syntax: "${originalText}". Target and selector are both required.`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    const rawTarget = text.slice(1, targetEndIdx).trim()
    const rawSelector = text.slice(targetEndIdx + 1).trim()

    const target = stripBlockComments(rawTarget)
    const selector = stripBlockComments(rawSelector)

    if (!target || !selector) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-state-syntax',
            message: `Invalid @state syntax: "${originalText}". Target and selector are both required.`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    let targetAst: Selector | undefined
    let selectorAst: SelectorList | undefined
    try {
        targetAst = styleSyntax.parse(target, { context: 'selector' }) as Selector
    } catch {
        // Target may be a non-standard or dirty string (e.g. BUG-02 B3 'button // x')
    }

    try {
        selectorAst = styleSyntax.parse(selector, { context: 'selectorList' }) as SelectorList
    } catch {
        // Selector may be a non-standard selector
    }

    return {
        ok: true,
        valid: true,
        target,
        targetAst,
        selector,
        selectorAst
    }
}

export interface VariantPreludeSuccess {
    readonly ok: true
    readonly valid: true
    readonly names: readonly string[]
    readonly variants: readonly string[]
    readonly raw: string
    readonly rawParam: string
}

export interface VariantPreludeFailure {
    readonly ok: false
    readonly valid: false
    readonly names?: undefined
    readonly variants?: undefined
    readonly raw?: undefined
    readonly rawParam?: undefined
    readonly warning?: StyleDiagnosticWarning
}

export type VariantPreludeResult = VariantPreludeSuccess | VariantPreludeFailure

export interface VariantPreludeOptions {
    readonly onWarn?: (warning: StyleDiagnosticWarning) => void
    readonly knownVariants?: readonly string[]
    readonly isNestedVariant?: boolean
}

/**
 * Validates and parses @variant prelude (Rule V1–V4).
 * Header format: (name1, name2)
 * Disallows wildcards (*), negations (!), unknown variants, and nested variants.
 */
export function parseVariantPrelude(
    preludeInput: CssNode | string | null | undefined,
    optionsOrKnown?: VariantPreludeOptions | readonly string[] | ((warning: StyleDiagnosticWarning) => void),
    maybeWarn?: (warning: StyleDiagnosticWarning) => void
): VariantPreludeResult {
    let onWarn: ((warning: StyleDiagnosticWarning) => void) | undefined
    let knownVariants: readonly string[] | undefined
    let isNestedVariant = false

    if (typeof optionsOrKnown === 'function') {
        onWarn = optionsOrKnown
    } else if (Array.isArray(optionsOrKnown)) {
        knownVariants = optionsOrKnown
        onWarn = maybeWarn
    } else if (optionsOrKnown && typeof optionsOrKnown === 'object' && !Array.isArray(optionsOrKnown)) {
        const opts = optionsOrKnown as VariantPreludeOptions
        onWarn = opts.onWarn
        knownVariants = opts.knownVariants
        isNestedVariant = Boolean(opts.isNestedVariant)
    }

    const rawText = typeof preludeInput === 'string' ? preludeInput.trim() : getPreludeText(preludeInput)
    const originalText = typeof preludeInput === 'string' ? preludeInput : rawText

    let text = rawText
    if (text.startsWith('@variant')) {
        text = text.slice(8).trim()
    }

    if (!text.startsWith('(') || !text.endsWith(')')) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-variant',
            message: `Invalid @variant syntax: "${originalText}".`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    const inner = text.slice(1, -1).trim()
    const cleanInner = stripBlockComments(inner)
    if (!cleanInner || cleanInner.replace(/,/g, '').trim() === '') {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-variant',
            message: `Empty @variant name list: "${originalText}".`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    const variantNames = splitSelectorByComma(cleanInner)
        .map((v) => v.trim())
        .filter(Boolean)

    if (variantNames.length === 0) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-variant',
            message: `Empty @variant name list: "${originalText}".`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    // Rule V2: Wildcards and negations are not supported
    if (variantNames.some((v) => v === '*' || v === '**' || v.startsWith('!'))) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-variant-name',
            message: `Wildcards and negations are not supported in @variant: "${inner}".`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    // Rule V3: Known variants schema validation
    if (knownVariants && knownVariants.length > 0) {
        for (const v of variantNames) {
            if (!knownVariants.includes(v)) {
                const warning: StyleDiagnosticWarning = {
                    type: 'unknown-variant',
                    message: `Unknown variant "${v}" in @variant: "${inner}".`
                }
                onWarn?.(warning)
                return { ok: false, valid: false, warning }
            }
        }
    }

    // Rule V4: Nested @variant check
    if (isNestedVariant) {
        const warning: StyleDiagnosticWarning = {
            type: 'nested-variant',
            message: 'Nested @variant at-rules are not supported.'
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    return {
        ok: true,
        valid: true,
        names: variantNames,
        variants: variantNames,
        raw: inner,
        rawParam: inner
    }
}

export interface WhenPreludeSuccess {
    readonly ok: true
    readonly valid: true
    readonly conditions: readonly string[]
    readonly selectorText: string
    readonly selectorAst: SelectorList
    readonly raw: string
    readonly rawParam: string
}

export interface WhenPreludeFailure {
    readonly ok: false
    readonly valid: false
    readonly conditions?: undefined
    readonly selectorText?: undefined
    readonly selectorAst?: undefined
    readonly raw?: undefined
    readonly rawParam?: undefined
    readonly warning?: StyleDiagnosticWarning
}

export type WhenPreludeResult = WhenPreludeSuccess | WhenPreludeFailure

export interface WhenPreludeOptions {
    readonly onWarn?: (warning: StyleDiagnosticWarning) => void
    readonly isNestedWhen?: boolean
}

/**
 * Validates whether a Selector AST node is strictly mounted on :host.
 */
export function isHostMountedSelectorAst(selectorNode: Selector): boolean {
    if (!selectorNode || !selectorNode.children) return false
    const children = selectorNode.children.toArray()
    if (children.length === 0) return false

    // 1. Must not contain ANY combinator
    for (const node of children) {
        if (node.type === 'Combinator') {
            return false
        }
    }

    // 2. First node must be :host or :where(:host...)/:is(:host...)
    const firstNode = children[0]
    if (firstNode.type !== 'PseudoClassSelector') {
        return false
    }

    if (firstNode.name === 'host') {
        return true
    }

    if (firstNode.name === 'is' || firstNode.name === 'where') {
        if (!firstNode.children || firstNode.children.isEmpty) {
            return false
        }
        const rawOrList = firstNode.children.first
        if (!rawOrList) return false
        let selectorList: SelectorList
        if (rawOrList.type === 'Raw') {
            selectorList = styleSyntax.parse(rawOrList.value, { context: 'selectorList' }) as SelectorList
        } else if (rawOrList.type === 'SelectorList') {
            selectorList = rawOrList as SelectorList
        } else {
            return false
        }

        const innerSelectors = selectorList.children.toArray()
        if (innerSelectors.length === 0) return false

        return innerSelectors.every((sel) => isHostMountedSelectorAst(sel as Selector))
    }

    return false
}

/**
 * Validates and parses @when prelude (Rule W1–W5).
 * Header format: (condition1, condition2)
 * Must be mounted on :host. Enforces priority chain: syntax > host > nesting (BUG-06 D3).
 */
export function parseWhenPrelude(
    preludeInput: CssNode | string | null | undefined,
    optionsOrWarn?: WhenPreludeOptions | ((warning: StyleDiagnosticWarning) => void)
): WhenPreludeResult {
    const onWarn = typeof optionsOrWarn === 'function' ? optionsOrWarn : optionsOrWarn?.onWarn
    const isNestedWhen = typeof optionsOrWarn === 'object' ? Boolean(optionsOrWarn?.isNestedWhen) : false

    const rawText = typeof preludeInput === 'string' ? preludeInput.trim() : getPreludeText(preludeInput)
    const originalText = typeof preludeInput === 'string' ? preludeInput : rawText

    let text = rawText
    if (text.startsWith('@when')) {
        text = text.slice(5).trim()
    }

    // W1/W2 Syntax check (takes precedence over nesting per BUG-06 D3)
    if (!text.startsWith('(') || !text.endsWith(')')) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-when',
            message: `Invalid @when syntax: "${originalText}".`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    const inner = text.slice(1, -1).trim()
    const cleanInner = stripBlockComments(inner)
    if (!cleanInner || cleanInner.replace(/,/g, '').trim() === '') {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-when',
            message: `Empty @when condition list: "${originalText}".`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    const conditions = splitSelectorByComma(cleanInner)
        .map((c) => c.trim())
        .filter(Boolean)

    if (conditions.length === 0) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-when',
            message: `Empty @when condition list: "${originalText}".`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    // W3/W4 Host-mounted check (takes precedence over nesting per BUG-06 D3)
    if (!conditions.every(isHostMountedSelector)) {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-when-condition',
            message: `@when condition "${inner}" must be mounted on :host.`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    // W5 Nesting check
    if (isNestedWhen) {
        const warning: StyleDiagnosticWarning = {
            type: 'nested-when',
            message: 'Nested @when at-rules are not supported.'
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    const selectorText = conditions.join(', ')
    let selectorAst: SelectorList
    try {
        selectorAst = styleSyntax.parse(selectorText, { context: 'selectorList' }) as SelectorList
    } catch {
        const warning: StyleDiagnosticWarning = {
            type: 'invalid-when-condition',
            message: `@when condition "${inner}" must be mounted on :host.`
        }
        onWarn?.(warning)
        return { ok: false, valid: false, warning }
    }

    return {
        ok: true,
        valid: true,
        conditions,
        selectorText,
        selectorAst,
        raw: inner,
        rawParam: inner
    }
}

/**
 * Unified prelude parser per interface contract in PROJECT.md.
 */
export function parsePrelude(
    atrule: 'when' | 'variant' | 'state' | string,
    textOrNode: CssNode | string,
    options?: {
        onWarn?: (warning: StyleDiagnosticWarning) => void
        knownVariants?: readonly string[]
        isNestedVariant?: boolean
        isNestedWhen?: boolean
    }
): WhenPreludeResult | VariantPreludeResult | StatePreludeResult {
    switch (atrule.toLowerCase()) {
        case 'when':
            return parseWhenPrelude(textOrNode, options)
        case 'variant':
            return parseVariantPrelude(textOrNode, options)
        case 'state':
            return parseStatePrelude(textOrNode, options)
        default:
            return { ok: false, valid: false }
    }
}

/**
 * Checks if a block AST contains nested at-rules of a specific name.
 */
export function hasNestedAtrule(blockNode: CssNode, atruleName: string): boolean {
    let found = false
    walk(blockNode, {
        visit: 'Atrule',
        enter(node: Atrule) {
            if (node.name.toLowerCase() === atruleName.toLowerCase()) {
                found = true
            }
        }
    })
    return found
}
