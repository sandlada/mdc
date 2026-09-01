/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import {
    StateTriggerRegistry,
    type StateTrigger,
} from './state-trigger'
import type { CompileStateSheetOptions } from './state-sheet-compiler'

export const IS_STYLE_SHEET_OPTIONS = Symbol.for('mdc.is_style_sheet_options')

export interface CreateStyleSheetOptions extends CompileStateSheetOptions {
    [IS_STYLE_SHEET_OPTIONS]?: true
}

export interface WithStateTriggersFn {
    (existingOptions?: CreateStyleSheetOptions): CreateStyleSheetOptions
    [IS_STYLE_SHEET_OPTIONS]: true
    options: CreateStyleSheetOptions
}

/**
 * Higher-order configuration function to inject custom State Triggers into style sheet compilation pipelines.
 */
export function withStateTriggers(
    triggers: (StateTrigger | Record<string, StateTrigger | string>)[] | Record<string, StateTrigger | string>
): WithStateTriggersFn {
    const optionsObj: CreateStyleSheetOptions = {
        triggers,
        [IS_STYLE_SHEET_OPTIONS]: true,
    }

    const fn = ((existingOptions?: CreateStyleSheetOptions): CreateStyleSheetOptions => {
        if (!existingOptions) {
            return optionsObj
        }

        const registry = existingOptions.registry
            ? existingOptions.registry.clone()
            : new StateTriggerRegistry(existingOptions.triggers)

        registry.registerAll(triggers)

        return {
            ...existingOptions,
            registry,
            [IS_STYLE_SHEET_OPTIONS]: true,
        }
    }) as WithStateTriggersFn

    fn[IS_STYLE_SHEET_OPTIONS] = true
    fn.options = optionsObj

    return fn
}
