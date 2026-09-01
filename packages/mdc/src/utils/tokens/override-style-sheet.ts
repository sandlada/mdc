/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import type { CSSResult } from 'lit'
import {
    overrideTokens,
    type OverridePrefixOrOptions,
    type OverrideTokens,
    type OverrideTokensOptions,
    type OverrideTokenKey,
    type OverrideValue,
} from './override-tokens'

export type {
    OverridePrefixOrOptions,
    OverrideTokens,
    OverrideTokensOptions,
    OverrideTokenKey,
    OverrideValue,
}

/**
 * Type-safe helper to override component CSS custom properties.
 *
 * Automatically resolves base token names, state-specific names, tuples, and state objects.
 * Supports curried data-last HOF and uncurried invocations.
 *
 * @deprecated Use `overrideTokens` instead for pure functional, curried, data-last token overrides.
 */
export function overrideStyleSheet<TDef extends Record<string, any> = Record<string, any>>(
    prefixOrOptions: OverridePrefixOrOptions
): (tokens: OverrideTokens<TDef>) => (definition?: TDef) => CSSResult

export function overrideStyleSheet<TDef extends Record<string, any> = Record<string, any>>(
    prefixOrOptions: OverridePrefixOrOptions,
    tokens: OverrideTokens<TDef>
): (definition?: TDef) => CSSResult

export function overrideStyleSheet<TDef extends Record<string, any>>(
    definition: TDef,
    prefixOrOptions: OverridePrefixOrOptions,
    tokens: OverrideTokens<TDef>
): CSSResult

export function overrideStyleSheet(arg1: any, arg2?: any, arg3?: any): any {
    return (overrideTokens as any)(arg1, arg2, arg3)
}
