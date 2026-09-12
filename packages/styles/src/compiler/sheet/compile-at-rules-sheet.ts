/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StateSchema } from '../../schema'
import { emptyTables, resolveState } from '../../schema'
import type { TriggerTables } from '../../schema'
import type { CompileStateSheetOptions } from './compile-state-sheet'
import {
    extractStateTokenMetadata,
    type StateTokenMetadata
} from './extract-state-token-metadata'
import { expandA11yPresets, transformStatements } from '../transforms'
import { mergeHoistedRules } from '../hoist'
import type { StateDimensionItem } from '../transforms'
import { parseStatements } from '../internal/primitives'

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

export function resolveStateModifiers(
    definition: any,
    tables: TriggerTables
): { states: StateDimensionItem[] | StateDimensionItem[][]; isCombo: boolean; schema?: StateSchema<any> } {
    let schema: StateSchema<any> | undefined = definition?.schema
    if (!schema && Array.isArray(definition)) {
        for (const item of definition) {
            if (item?.schema) {
                schema = item.schema
                break
            }
        }
    }
    if (!schema && typeof definition === 'object' && definition !== null) {
        for (const val of Object.values(definition)) {
            if (val && typeof val === 'object' && (val as any).schema) {
                schema = (val as any).schema
                break
            }
        }
    }

    if (schema?.dimensions && schema.dimensions.length > 1) {
        // Cartesian combo
        const combos = schema.validCombinations as readonly (readonly string[])[]
        const comboItems: StateDimensionItem[][] = []

        for (const combo of combos) {
            const items: StateDimensionItem[] = []
            for (const sName of combo) {
                const resolved = resolveState(sName, { anchor: '', isHostAnchor: false })(tables)
                items.push({
                    name: sName,
                    modifier: resolved.modifier,
                    target: resolved.target
                })
            }
            comboItems.push(items)
        }
        return { states: comboItems, isCombo: true, schema }
    }

    const stateNames: string[] = schema?.states ? [...schema.states] : []
    if (stateNames.length === 0) {
        return {
            states: [
                { name: 'enabled', modifier: '', target: 'self' }
            ],
            isCombo: false,
            schema
        }
    }

    const singleItems: StateDimensionItem[] = stateNames.map((sName) => {
        const resolved = resolveState(sName, { anchor: '', isHostAnchor: false })(tables)
        return {
            name: sName,
            modifier: resolved.modifier,
            target: resolved.target
        }
    })

    return { states: singleItems, isCombo: false, schema }
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

    const a11yExpanded = expandA11yPresets(cssText)

    const tables = options?.tables ?? emptyTables

    if (/@contrast(?![-a-zA-Z0-9_])/.test(a11yExpanded) && options?.onWarn) {
        options.onWarn({
            type: 'invalid-a11y-macro',
            message: 'Invalid @contrast syntax. Use @contrast-more or @contrast-less.'
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
