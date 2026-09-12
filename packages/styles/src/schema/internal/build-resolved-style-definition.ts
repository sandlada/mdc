/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import type { StateSchema } from '../define-schema'
import type { ForwardedTokenMeta, ResolvedStyleDefinition } from '../create-style-definition'
import { FORWARDED_TOKEN_META } from '../create-style-definition'
import { isPlainObject } from './is-plain-object'
import { deepFreezeNDCopy, flattenNDValue, getEffectiveTopology, getRank1States } from './ndarray'

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
            const topology = getEffectiveTopology(schema)
            if (topology.rank > 1) {
                flattenNDValue(topology, key, val)
                normalizedTokens[key] = deepFreezeNDCopy(val)
                continue
            }
            if (topology.rank === 0) {
                throw new Error(`[createStyleDefinition] Token '${key}' uses an array but the schema holds a single combination: only stateless values are allowed.`)
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
            const topology = getEffectiveTopology(schema)
            if (topology.rank > 1) {
                for (const cell of flattenNDValue(topology, key, val)) {
                    result[`${cell.canonical}-${key}`] = cell.value
                }
            } else {
                const rank1 = getRank1States(topology)
                const names = rank1 !== null && val.length === rank1.length ? rank1 : schema.states
                for (let i = 0; i < names.length; i++) {
                    const sVal = val[i]
                    if (sVal !== null && sVal !== undefined) {
                        const stateName = names[i]
                        result[`${stateName}-${key}`] = sVal
                    }
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
