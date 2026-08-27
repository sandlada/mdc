/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { DefinitionMeta, TokenValueMeta, ForwardedChildMeta, SourceRange } from './types'

const STATE_NAMES = ['enabled', 'hovered', 'pressed', 'focused', 'disabled'] as const

function cleanKey(raw: string): string {
    return raw.replace(/^['"`]/, '').replace(/['"`]$/, '').replace(/^--/, '').trim()
}

function cleanPrefix(raw: string): string {
    return raw.replace(/^['"`]/, '').replace(/['"`]$/, '').replace(/-$/, '').trim()
}

function getSourceRange(sourceText: string, startIndex: number, length: number): SourceRange {
    const textBefore = sourceText.substring(0, startIndex)
    const lines = textBefore.split('\n')
    const startLine = lines.length - 1
    const startCol = lines[lines.length - 1].length

    const matchText = sourceText.substring(startIndex, startIndex + length)
    const matchLines = matchText.split('\n')
    const endLine = startLine + matchLines.length - 1
    const endCol = matchLines.length === 1 ? startCol + length : matchLines[matchLines.length - 1].length

    return { startLine, startCol, endLine, endCol }
}

/**
 * Extracts balanced block content between openChar and closeChar starting from startIndex.
 */
function extractBalancedBlock(
    text: string,
    startIndex: number,
    openChar = '{',
    closeChar = '}'
): { content: string; startIndex: number; endIndex: number } | null {
    let depth = 0
    let start = -1
    for (let i = startIndex; i < text.length; i++) {
        if (text[i] === openChar) {
            if (depth === 0) start = i + 1
            depth++
        } else if (text[i] === closeChar) {
            depth--
            if (depth === 0 && start !== -1) {
                return { content: text.substring(start, i), startIndex: start, endIndex: i }
            }
        }
    }
    return null
}

/**
 * Analyzes the source text of a *.definition.ts file and extracts own tokens & forwarded child tokens.
 * Robust, zero-dependency parser compatible across all JS/TS environments.
 */
export function analyzeDefinitionSource(sourceText: string, filePath?: string): DefinitionMeta | null {
    // 1. Find `createStyleDefinition({ ... })`
    const varMatch = /export\s+const\s+([a-zA-Z0-9_$]+)\s*=\s*createStyleDefinition/.exec(sourceText)
    const definitionName = varMatch ? varMatch[1] : 'ComponentDefinition'

    const createIndex = sourceText.indexOf('createStyleDefinition')
    if (createIndex === -1) return null

    // Extract balanced body of createStyleDefinition
    const openParen = sourceText.indexOf('(', createIndex)
    if (openParen === -1) return null

    const openBrace = sourceText.indexOf('{', openParen)
    if (openBrace === -1) return null

    const defBlock = extractBalancedBlock(sourceText, openBrace - 1, '{', '}')
    if (!defBlock) return null

    const bodyText = defBlock.content
    const bodyGlobalOffset = defBlock.startIndex

    const ownTokens = new Map<string, TokenValueMeta>()
    const forwarded = new Map<string, ForwardedChildMeta>()

    // 2. Parse `...forwardTokens(TargetDef, { ... })`
    let searchPos = 0
    const fwdKeyword = '...forwardTokens'

    while ((searchPos = bodyText.indexOf(fwdKeyword, searchPos)) !== -1) {
        const afterKeyword = bodyText.substring(searchPos + fwdKeyword.length)
        const targetArgMatch = /^\s*\(\s*([a-zA-Z0-9_$]+)\s*,\s*\{/.exec(afterKeyword)

        if (targetArgMatch) {
            const targetDefName = targetArgMatch[1]
            const optionsStart = searchPos + fwdKeyword.length + targetArgMatch[0].length - 1
            const optionsBlock = extractBalancedBlock(bodyText, optionsStart, '{', '}')

            if (optionsBlock) {
                const optionsBody = optionsBlock.content
                const optionsGlobalOffset = bodyGlobalOffset + optionsBlock.startIndex

                const prefixMatch = /targetPrefix\s*:\s*['"`]([^'"`]+)['"`]/.exec(optionsBody)
                const nameMatch = /name\s*:\s*['"`]([^'"`]+)['"`]/.exec(optionsBody)
                const tokensIndex = optionsBody.indexOf('tokens')

                const targetPrefix = prefixMatch ? cleanPrefix(prefixMatch[1]) : ''
                const name = nameMatch ? cleanPrefix(nameMatch[1]) : ''
                const namespace = name || targetPrefix.replace(/^--/, '').replace(/^(mdc|md)-/, '')

                const forwardedTokensMap: Record<string, any> = {}

                if (tokensIndex !== -1) {
                    const tokenBrace = optionsBody.indexOf('{', tokensIndex)
                    if (tokenBrace !== -1) {
                        const tokenBlock = extractBalancedBlock(optionsBody, tokenBrace, '{', '}')
                        if (tokenBlock) {
                            const tokenBody = tokenBlock.content
                            const tokenGlobalOffset = optionsGlobalOffset + tokenBlock.startIndex
                            const tokenLineRegex = /['"`]([a-zA-Z0-9_-]+)['"`]\s*:\s*(\[[^\]]*\]|[^,\n]+)/g
                            let tMatch: RegExpExecArray | null

                            while ((tMatch = tokenLineRegex.exec(tokenBody)) !== null) {
                                const tokenKey = cleanKey(tMatch[1])
                                const valRaw = tMatch[2].trim()
                                const matchAbsoluteIndex = tokenGlobalOffset + tMatch.index
                                const range = getSourceRange(sourceText, matchAbsoluteIndex, tMatch[0].length)

                                if (valRaw.startsWith('[')) {
                                    const elements = valRaw
                                        .slice(1, -1)
                                        .split(',')
                                        .map((s) => s.trim())

                                    const activeStates: string[] = []
                                    elements.forEach((elem, index) => {
                                        if (elem && elem !== 'null' && elem !== 'undefined' && elem !== 'void 0') {
                                            if (index < STATE_NAMES.length) {
                                                activeStates.push(STATE_NAMES[index])
                                            }
                                        }
                                    })

                                    forwardedTokensMap[tokenKey] = {
                                        isTuple: true,
                                        states: activeStates,
                                        rawValue: valRaw,
                                        range,
                                    }
                                } else {
                                    forwardedTokensMap[tokenKey] = {
                                        isTuple: false,
                                        states: ['static'],
                                        rawValue: valRaw,
                                        range,
                                    }
                                }
                            }
                        }
                    }
                }

                const fwdGlobalIndex = bodyGlobalOffset + searchPos
                forwarded.set(targetDefName, {
                    targetDefinitionName: targetDefName,
                    targetPrefix: targetPrefix.startsWith('--') ? targetPrefix : `--${targetPrefix}`,
                    namespace,
                    tokens: forwardedTokensMap,
                    range: getSourceRange(sourceText, fwdGlobalIndex, optionsBlock.endIndex - searchPos),
                })

                searchPos = optionsBlock.endIndex
            } else {
                searchPos += fwdKeyword.length
            }
        } else {
            searchPos += fwdKeyword.length
        }
    }

    // 3. Remove forwardTokens blocks and parse own tokens
    let strippedBody = bodyText
    let fwdCleanPos = 0
    while ((fwdCleanPos = strippedBody.indexOf(fwdKeyword)) !== -1) {
        const after = strippedBody.substring(fwdCleanPos)
        const openP = after.indexOf('(')
        if (openP !== -1) {
            const parenBlock = extractBalancedBlock(after, openP, '(', ')')
            if (parenBlock) {
                // Replace with whitespace of same length to preserve character offsets
                const gapLength = parenBlock.endIndex + 1
                const spaces = ' '.repeat(gapLength)
                strippedBody = strippedBody.substring(0, fwdCleanPos) + spaces + after.substring(gapLength)
            } else {
                break
            }
        } else {
            break
        }
    }

    const propRegex = /['"`]([a-zA-Z0-9_-]+)['"`]\s*:\s*(\[[^\]]*\]|[^,\n]+)/g
    let pMatch: RegExpExecArray | null

    while ((pMatch = propRegex.exec(strippedBody)) !== null) {
        const key = cleanKey(pMatch[1])
        const valRaw = pMatch[2].trim()
        const matchAbsoluteIndex = bodyGlobalOffset + pMatch.index
        const range = getSourceRange(sourceText, matchAbsoluteIndex, pMatch[0].length)

        if (valRaw.startsWith('[')) {
            const elements = valRaw
                .slice(1, -1)
                .split(',')
                .map((s) => s.trim())

            const activeStates: string[] = []
            const rawStates: (string | null | undefined)[] = []

            elements.forEach((elem, index) => {
                if (elem && elem !== 'null' && elem !== 'undefined' && elem !== 'void 0') {
                    if (index < STATE_NAMES.length) {
                        activeStates.push(STATE_NAMES[index])
                    }
                    rawStates.push(elem)
                } else {
                    rawStates.push(null)
                }
            })

            ownTokens.set(key, {
                key,
                isTuple: true,
                states: activeStates,
                rawStates,
                rawValue: valRaw,
                range,
            })
        } else {
            ownTokens.set(key, {
                key,
                isTuple: false,
                states: ['static'],
                rawValue: valRaw,
                range,
            })
        }
    }

    return {
        name: definitionName,
        filePath,
        ownTokens,
        forwarded,
    }
}
