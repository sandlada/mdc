/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Next-Generation Styles & Token Engine for `@sandlada/mdc`.
 *
 * Provides pure functional, curried, data-last utilities for state-aware CSS variable generation,
 * AST-driven state stylesheet compilation, child token forwarding, selector composition, and overrides.
 *
 * @example
 * ```typescript
 * import {
 *     defineSchema,
 *     createStyleDefinition,
 *     forwardTokens,
 *     stringifyTokens,
 *     createStyleSheet,
 *     mapStateTriggers,
 *     hostTrigger,
 *     selfTrigger,
 *     overrideTokens,
 *     pipe
 * } from '@sandlada/mdc/utils'
 * ```
 */

// 1. Schema & Token Definition Layer
export {
    defineSchema,
    type StateSchema
} from './define-schema'

export {
    createStyleDefinition,
    FORWARDED_TOKEN_META,
    type PrimitiveTokenValue,
    type StateTuple,
    type StateRecord,
    type TokenValue,
    type ForwardedTokenMeta,
    type ResolvedStyleDefinition
} from './create-style-definition'

export {
    forwardTokens,
    type ForwardTokenKey,
    type ForwardTokensOptions,
    type ForwardedTokensResult
} from './forward-tokens'

// 2. Stringification & State Mapping Layer
export {
    stringifyTokens,
    type StringifyTokensOptions,
    type StringifyPrefixOrOptions
} from './stringify-tokens'

export {
    hostTrigger,
    type TriggerTarget,
    type TriggerContext,
    type ResolvedTrigger,
    type StateTrigger
} from './host-trigger'

export {
    selfTrigger
} from './self-trigger'

export {
    mapStateTriggers,
    StateTriggerRegistry
} from './map-state-triggers'

export {
    overrideTokens,
    type OverrideTokensOptions
} from './override-tokens'

// 3. Compiler & ATRules Engine
export {
    pipe
} from './pipe'

export {
    compileStateSheet,
    extractStateTokenMetadata,
    type ASTNode,
    type DeclarationNode,
    type StyleRuleNode,
    type WrapperAtRuleNode,
    type KeyframeStepNode,
    type KeyframesNode,
    type CompileStateSheetOptions,
    type StateTokenMetadata
} from './state-sheet-compiler'

export {
    createStyleSheet,
    type StyleSheetCallback,
    type TaggedTemplateFn,
    type StyleSheetCurriedWithDef,
    type StyleSheetCurriedWithOptions,
    type CreateStyleSheetFn
} from './create-style-sheet'
export { Color } from './color'

export type CreateStyleSheetOptions = import('./state-sheet-compiler').CompileStateSheetOptions
