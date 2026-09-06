/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Node-safe pure style engine entry for tooling (e.g. `@sandlada/vscode-mdc`).
 *
 * Scoped replacement for the removed top-level `src/style-engine.ts`.
 * Import from `@sandlada/mdc/utils/styles/style-engine`.
 *
 * Intentionally excludes the Lit adapter (`lit`, i.e. `toLit`) which pulls
 * `lit` runtime (`unsafeCSS` -> `reactive-element` -> `HTMLElement`) and crash
 * in a plain Node extension host. Everything re-exported here imports only
 * types or pure logic and is safe to bundle into VS Code extensions and TS
 * server plugins.
 */

export {
    MDCStyleSheet,
    isCSSLike,
    cssTextOf,
    sheetOf,
    emptySheet,
    type CSSLike,
    type ToCSSVariableLike,
    type StyleTemplateValue
} from '../css-like'

export {
    defineSchema,
    type StateSchema
} from '../define-schema'

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
} from '../create-style-definition'

export {
    forwardTokens,
    type ForwardTokenKey,
    type ForwardTokensOptions,
    type ForwardedTokensResult
} from '../forward-tokens'

export {
    mapStateTriggers,
    StateTriggerRegistry,
    type TriggerTarget,
    type TriggerContext,
    type ResolvedTrigger,
    type StateTrigger
} from '../map-state-triggers'

export {
    stringifyTokens,
    type StringifyTokensOptions,
    type StringifyPrefixOrOptions
} from '../stringify-tokens'

export {
    defineVariantTokens,
    type DefineVariantTokensOptions,
    type DefineVariantTokensOptionsOrPrefix
} from '../define-variant-tokens'

export {
    overrideTokens,
    overrideComponentTokens,
    stringTokens,
    type OverrideTokensOptions
} from '../override-tokens'

export {
    createStyleSheet,
    type StyleSheetCallback,
    type TaggedTemplateFn,
    type StyleSheetCurriedWithDef,
    type StyleSheetCurriedWithOptions,
    type CreateStyleSheetFn,
    type CreateStyleSheetOptions
} from '../compiler/create-style-sheet'

export {
    pipe
} from '../pipe'

export {
    compileStateSheet,
    type ASTNode,
    type DeclarationNode,
    type StyleRuleNode,
    type WrapperAtRuleNode,
    type KeyframeStepNode,
    type KeyframesNode,
    type CompileStateSheetOptions,
    type StyleDiagnosticWarning
} from '../compiler/compile-state-sheet'

export {
    extractStateTokenMetadata,
    type StateTokenMetadata
} from '../compiler/extract-state-token-metadata'

export {
    canonicalizeState,
    splitSelectorByComma,
    extractHostAndDescendant,
    appendToHostSelector,
    composeStateSelector,
    type ComposeSelectorOptions
} from '../compiler/compose-state-selector'

export {
    matchVariants
} from '../compiler/match-variants'

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
} from '../expand-shape'

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
} from '../expand-padding'

export {
    expandMargin,
    type PrimitiveMarginValue,
    type MarginAxisTuple,
    type MarginEdgeTuple,
    type MarginObject,
    type SingleMarginValue,
    type MultiStateMarginTuple,
    type MultiStateMarginRecord,
    type ExpandMarginInput,
    type NormalizeMarginPrefix,
    type MarginEdgeSuffix,
    type MarginTokenKey,
    type ExtractSingleMarginValue,
    type ExtractMarginEdgeValue,
    type ExpandedMarginResult
} from '../expand-margin'

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
} from '../expand-typescale'
