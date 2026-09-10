/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StateSchema } from '../schema'
import { emptyTables } from '../schema'
import type { TriggerTables } from '../schema'
import type { CompileStateSheetOptions } from './compile-state-sheet'
import {
    extractStateTokenMetadata,
    type StateTokenMetadata
} from './extract-state-token-metadata'
import { expandA11yPresets } from './expand-a11y-presets'
import { stripComments } from './strip-comments'
import { mergeHoistedRules } from './merge-hoisted-rules'
import type { StateDimensionItem } from './rewrite-state-variables'
import {
    parseStatements,
    resolveStateModifiers,
    transformStatements
} from './internal/at-rules-transformer'

export type { StateDimensionItem }

export interface AtRulesCompilerContext {
    readonly states: readonly StateDimensionItem[] | readonly (readonly StateDimensionItem[])[]
    readonly isCombo: boolean
    readonly tables: TriggerTables
    readonly options?: CompileStateSheetOptions
    readonly meta?: StateTokenMetadata
    readonly ancestorPath: readonly string[]
    readonly currentStates?: readonly string[]
    readonly variantSelector?: string
    readonly isolationContainer?: string
    readonly stateNestingDepth?: number
    readonly schema?: StateSchema<any>
}

/**
 * Main compilation entrypoint for the new At-Rules style engine.
 */
export const compileAtRulesSheet = (
    definition: any,
    cssText: string,
    options?: CompileStateSheetOptions
): string => {
    if (!cssText || typeof cssText !== 'string' || cssText.trim().length === 0) {
        return ''
    }

    const cleanCss = stripComments(cssText)
    const a11yExpanded = expandA11yPresets(cleanCss)

    const tables = options?.tables ?? emptyTables

    if (/@contrast\b(?!\s*\(\s*(more|less)\s*\))/.test(a11yExpanded) && options?.onWarn) {
        options.onWarn({
            type: 'invalid-a11y-macro',
            message: 'Invalid @contrast syntax. Supported parameters are (more) or (less).'
        })
    }

    const { states, isCombo, schema } = resolveStateModifiers(definition, tables)

    if (isCombo) {
        const comboList = states as StateDimensionItem[][]
        if (comboList.length > 64 && options?.onWarn) {
            options.onWarn({
                type: 'explosive-cartesian-matrix',
                message: `State schema generated ${comboList.length} Cartesian combinations, exceeding the recommended limit of 64.`
            })
        }
    }

    const meta = definition && typeof definition === 'object'
        ? extractStateTokenMetadata(definition)
        : undefined

    const rootCtx: AtRulesCompilerContext = {
        states,
        isCombo,
        tables,
        options,
        meta,
        schema,
        ancestorPath: []
    }

    const stmts = parseStatements(a11yExpanded)
    const res = transformStatements(stmts, rootCtx)
    const mergedHoisted = mergeHoistedRules(res.hoistedRules)

    return [...res.baseRules, ...mergedHoisted].join(' ').trim()
}
