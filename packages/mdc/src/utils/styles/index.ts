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
 * 新樣式系統僅包含兩種 at-rule：`@anchor(target)`（狀態錨點，掛載點即 target）
 * 與 `@variant(name, ...)`（變體名單，精確匹配，不支援通配符）。其餘舊 at-rule
 *（`@when`、`@slot`、`@slotted`、`@size`、`@elevation`、舊 `@anchor <sel>` 形）皆已棄用。
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
    DEFAULT_STYLE_SCHEMA,
    FORWARDED_TOKEN_META,
    type DefaultStyleSchema,
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
    defineVariantTokens,
    type DefineVariantTokensOptions,
    type DefineVariantTokensOptionsOrPrefix
} from './define-variant-tokens'

export {
    mapStateTriggers,
    StateTriggerRegistry,
    type TriggerTarget,
    type TriggerContext,
    type ResolvedTrigger,
    type StateTrigger
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

// 4. Functional Token Transformers Layer
export {
    expandShape,
    type CSSVariableProvider,
    type ShapeScalarValue,
    type ShapeCornersObject,
    type ShapeStateTuple,
    type ShapeStateRecord,
    type ShapeValueInput,
    type NormalizeShapePrefix,
    type ShapeCornerSuffix,
    type ShapeTokenKey,
    type ExpandShapeValueType,
    type ExpandedShapeResult
} from './expand-shape'

export {
    expandPadding,
    type PrimitivePaddingValue,
    type PaddingAxisTuple,
    type PaddingEdgeTuple,
    type PaddingObject,
    type SinglePaddingValue,
    type MultiStatePaddingTuple,
    type MultiStatePaddingRecord,
    type ExpandPaddingInput,
    type NormalizePaddingPrefix,
    type PaddingEdgeSuffix,
    type PaddingTokenKey,
    type ExtractSinglePaddingValue,
    type ExtractPaddingEdgeValue,
    type ExpandedPaddingResult
} from './expand-padding'

export {
    expandTypescale,
    type MDKTypescaleLike,
    type TypographyObject,
    type SingleTypescaleValue,
    type TypescaleTuple,
    type TypescaleRecord,
    type TypescaleValueInput,
    type NormalizeTypescalePrefix,
    type TypescalePropSuffix,
    type TypescaleTokenKey,
    type ExpandedTypescaleTokens,
    type ExpandedTypescaleResult,
    type ExtractedTypography,
    type ExtractFont,
    type ExtractLeading,
    type ExtractSize,
    type ExtractTracking,
    type ExtractWeight
} from './expand-typescale'

export type CreateStyleSheetOptions = import('./state-sheet-compiler').CompileStateSheetOptions


