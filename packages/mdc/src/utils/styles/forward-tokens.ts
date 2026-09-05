/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { FORWARDED_TOKEN_META, type ForwardedTokenMeta } from './create-style-definition'

type StripPrefix<K extends string> = K extends `--${infer Rest}` ? Rest : K

type ExtractDefKeys<T> = T extends { flatTokenKeys: readonly (infer K)[] }
    ? (K & string)
    : T extends { tokens: infer Tokens }
        ? (keyof Tokens & string)
        : T extends Record<string, any>
            ? (keyof T & string)
            : string

export type ForwardTokenKey<T> = ExtractDefKeys<T> | StripPrefix<ExtractDefKeys<T>>

export interface ForwardTokensOptions<TTargetDef = Record<string, any>> {
    /**
     * The CSS variable prefix the child component listens to (e.g. `'--mdc-icon'`, `'--mdc-focus-ring'`).
     */
    readonly targetPrefix: string

    /**
     * Optional namespace prefix used in the parent definition (defaults to cleaned targetPrefix, e.g. `'icon'`).
     */
    readonly name?: string

    /**
     * Token values to forward. Keys are strictly validated against TTargetDef.
     */
    readonly tokens: Partial<Record<ForwardTokenKey<TTargetDef> | (string & {}), any>>
}

type CleanNamespace<TPrefix extends string, TName extends string | undefined> =
    TName extends string
        ? TName extends `--${infer N}`
            ? N extends `mdc-${infer M}` ? M : N extends `md-${infer M}` ? M : N
            : TName extends `mdc-${infer M}` ? M : TName extends `md-${infer M}` ? M : TName
        : TPrefix extends `--${infer N}`
            ? N extends `mdc-${infer M}` ? M : N extends `md-${infer M}` ? M : N
            : TPrefix extends `mdc-${infer M}` ? M : TPrefix extends `md-${infer M}` ? M : TPrefix

type CleanKey<K extends string> = K extends `--${infer Rest}` ? Rest : K

export type ForwardedTokensResult<
    TOptions extends { readonly targetPrefix: string; readonly name?: string; readonly tokens?: Record<string, any> }
> = {
    [K in keyof TOptions['tokens'] & string as `${CleanNamespace<TOptions['targetPrefix'], TOptions['name']>}-${CleanKey<K>}`]: TOptions['tokens'][K]
}

function isPlainObject(value: unknown): value is Record<string, any> {
    if (typeof value !== 'object' || value === null) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

function cleanNamespace(targetPrefix: string, name?: string): string {
    if (name && name.trim().length > 0) {
        return name.replace(/^--/, '').replace(/^(mdc|md)-/, '').replace(/-+$/, '')
    }
    return targetPrefix.replace(/^--/, '').replace(/^(mdc|md)-/, '').replace(/-+$/, '')
}

/**
 * Namespaces and embeds child component tokens within a parent component definition.
 *
 * Outputs clean namespaced token keys while embedding bridge metadata extracted during `createStyleDefinition` normalization.
 *
 * @template TTargetDef - The child component definition type.
 * @template TOptions - The configuration options object.
 *
 * @param targetDef - The child component's style definition object.
 * @param options - Configuration specifying target prefix, parent namespace, and forwarded token values.
 * @returns A token record suitable for object spreading into parent definitions.
 *
 * @example
 * ```typescript
 * import { defineSchema } from '@sandlada/mdc/utils/styles/define-schema'
 * import { createStyleDefinition } from '@sandlada/mdc/utils/styles/create-style-definition'
 * import { forwardTokens } from '@sandlada/mdc/utils/styles/forward-tokens'
 *
 * const IconSchema = defineSchema(['enabled', 'selected'] as const)
 * const IconDefinition = createStyleDefinition(IconSchema)({
 *     'color': ['#ffffff', '#000000'],
 *     'size': '18px'
 * })
 *
 * const ButtonSchema = defineSchema(['enabled', 'selected'] as const)
 * export const ButtonDefinition = createStyleDefinition(ButtonSchema)({
 *     'container-color': ['#6750a4', '#e8def8'],
 *     ...forwardTokens(IconDefinition, {
 *         targetPrefix: '--mdc-icon',
 *         name: 'icon',
 *         tokens: {
 *             'color': ['#ffffff', '#1d192b'],
 *             'size': '18px'
 *         }
 *     })
 * })
 * ```
 */
export function forwardTokens<
    TTargetDef extends Record<string, any>,
    const TOptions extends ForwardTokensOptions<TTargetDef> = ForwardTokensOptions<TTargetDef>
>(
    targetDef: TTargetDef,
    options: TOptions
): ForwardedTokensResult<TOptions> & Record<string, any> {
    if (!options || typeof options !== 'object') {
        return {} as any
    }

    const { targetPrefix = '', name, tokens } = options
    const targetPrefixNormalized = targetPrefix.startsWith('--') ? targetPrefix : `--${targetPrefix}`
    const parentNamespace = cleanNamespace(targetPrefix, name)

    const targetDefKeys: readonly string[] = targetDef && typeof targetDef === 'object'
        ? (('flatTokenKeys' in targetDef && Array.isArray((targetDef as any).flatTokenKeys))
            ? (targetDef as any).flatTokenKeys
            : ('tokens' in targetDef && typeof (targetDef as any).tokens === 'object' && (targetDef as any).tokens !== null)
                ? Object.keys((targetDef as any).tokens)
                : Object.keys(targetDef))
        : []

    const result: Record<string, any> = {}

    for (const [rawKey, inputVal] of Object.entries(tokens ?? {})) {
        if (inputVal === null || inputVal === undefined) {
            continue
        }

        const val = (typeof inputVal === 'object' && (inputVal as any)?.__isForwardedPrimitive)
            ? (inputVal as any).rawVal
            : inputVal

        if (val === null || val === undefined) {
            continue
        }

        const cleanKey = rawKey.startsWith('--') ? rawKey.slice(2) : rawKey
        const parentKey = `${parentNamespace}-${cleanKey}`

        const meta: ForwardedTokenMeta = Object.freeze({
            targetPrefix: targetPrefixNormalized,
            cleanKey,
            parentKey,
            targetDefKeys: Object.freeze([...targetDefKeys])
        })

        if (Array.isArray(val)) {
            const wrappedArray = [...val]
            Object.defineProperty(wrappedArray, FORWARDED_TOKEN_META, {
                value: meta,
                enumerable: false,
                configurable: true,
                writable: true
            })
            result[parentKey] = wrappedArray
        } else if (
            isPlainObject(val) &&
            typeof (val as any).ToCSSVariable !== 'function' &&
            !('_$cssResult$' in (val as any)) &&
            !('cssText' in (val as any))
        ) {
            const wrappedObj = Object.assign({}, val)
            Object.defineProperty(wrappedObj, FORWARDED_TOKEN_META, {
                value: meta,
                enumerable: false,
                configurable: true,
                writable: true
            })
            result[parentKey] = wrappedObj
        } else if (typeof val === 'object' && val !== null) {
            const wrappedObj = Object.create(val)
            Object.defineProperty(wrappedObj, '__isForwardedPrimitive', {
                value: true,
                enumerable: false,
                configurable: true,
                writable: true
            })
            Object.defineProperty(wrappedObj, 'rawVal', {
                value: val,
                enumerable: false,
                configurable: true,
                writable: true
            })
            Object.defineProperty(wrappedObj, FORWARDED_TOKEN_META, {
                value: meta,
                enumerable: false,
                configurable: true,
                writable: true
            })
            result[parentKey] = wrappedObj
        } else {
            const primitiveWrapper = {
                __isForwardedPrimitive: true,
                rawVal: val,
                valueOf: () => val,
                toString: () => String(val),
                [Symbol.toPrimitive]: (hint?: string) => (hint === 'number' && typeof val === 'number' ? val : val),
                [FORWARDED_TOKEN_META]: meta
            }
            result[parentKey] = primitiveWrapper
        }
    }

    return result as any
}
