/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StateSchema } from '../define-schema'
import type { ForwardedTokenMeta, ResolvedStyleDefinition } from '../create-style-definition'
import { FORWARDED_TOKEN_META } from '../create-style-definition'
import { isPlainObject } from './is-plain-object'

export function buildResolvedStyleDefinition<
    TSchema extends StateSchema<any>,
    TTokens extends Record<string, any>
>(
    schema: TSchema,
    tokens: TTokens
): ResolvedStyleDefinition<TSchema, TTokens> {
    const normalizedTokens: Record<string, any> = {}
    const forwardedBridges: Record<string, ForwardedTokenMeta> = {}

    for (const [key, val] of Object.entries(tokens ?? {})) {
        if (val === null || val === undefined) {
            continue
        }

        const meta: ForwardedTokenMeta | undefined = (val as any)?.[FORWARDED_TOKEN_META]

        if ((val as any)?.__isForwardedPrimitive) {
            const rawVal = (val as any).rawVal
            normalizedTokens[key] = rawVal
            if (meta) {
                forwardedBridges[key] = meta
            }
            continue
        }

        if (Array.isArray(val)) {
            if (meta) {
                forwardedBridges[key] = meta
            }
            normalizedTokens[key] = Object.freeze([...val])
            continue
        }

        if (
            isPlainObject(val) &&
            typeof (val as any).ToCSSVariable !== 'function' &&
            !('_$cssResult$' in (val as any)) &&
            !('cssText' in (val as any))
        ) {
            if (meta) {
                forwardedBridges[key] = meta
            }
            const cleanedRecord: Record<string, any> = {}
            for (const [sKey, sVal] of Object.entries(val)) {
                if (sVal !== null && sVal !== undefined) {
                    cleanedRecord[sKey] = sVal
                }
            }
            normalizedTokens[key] = Object.freeze(cleanedRecord)
            continue
        }

        if (meta) {
            forwardedBridges[key] = meta
        }
        normalizedTokens[key] = val
    }

    const flatTokenKeys = Object.freeze(Object.keys(normalizedTokens))

    const result: any = {}

    for (const [key, val] of Object.entries(normalizedTokens)) {
        result[key] = val

        if (Array.isArray(val) && schema?.states) {
            for (let i = 0; i < schema.states.length; i++) {
                const sVal = val[i]
                if (sVal !== null && sVal !== undefined) {
                    const stateName = schema.states[i]
                    result[`${stateName}-${key}`] = sVal
                }
            }
        } else if (
            isPlainObject(val) &&
            typeof (val as any).ToCSSVariable !== 'function' &&
            !('_$cssResult$' in (val as any)) &&
            !('cssText' in (val as any))
        ) {
            for (const [sKey, sVal] of Object.entries(val)) {
                if (sVal !== null && sVal !== undefined) {
                    result[`${sKey}-${key}`] = sVal
                }
            }
        }
    }

    Object.defineProperties(result, {
        __brand: {
            value: 'ResolvedStyleDefinition',
            enumerable: false,
            writable: false,
            configurable: false
        },
        schema: {
            value: schema,
            enumerable: false,
            writable: false,
            configurable: false
        },
        tokens: {
            value: Object.freeze(normalizedTokens),
            enumerable: false,
            writable: false,
            configurable: false
        },
        flatTokenKeys: {
            value: flatTokenKeys,
            enumerable: false,
            writable: false,
            configurable: false
        },
        ...(Object.keys(forwardedBridges).length > 0
            ? {
                forwardedBridges: {
                    value: Object.freeze(forwardedBridges),
                    enumerable: false,
                    writable: false,
                    configurable: false
                }
            }
            : {})
    })

    return Object.freeze(result) as unknown as ResolvedStyleDefinition<TSchema, TTokens>
}
