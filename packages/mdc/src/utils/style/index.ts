/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Local token layer for `@sandlada/mdc`: plain `createStyleDefinition`,
 * shape / padding / margin / typescale expanders, and Lit-bound
 * `stringifyTokens` / `overrideTokens`.
 *
 * Simplified port without schema / Cartesian / at-rule compiler logic.
 * Import from here inside `packages/mdc`; the original `@sandlada/styles`
 * files stay untouched.
 */

export {
    MDCStyleSheet,
    cssTextOf,
    isCSSLike,
    type CSSLike,
    type ToCSSVariableLike
} from './css-like'

export {
    createStyleDefinition,
    type PrimitiveTokenValue,
    type TokenRecordValue,
    type TokenValue,
    type ResolvedStyleDefinition
} from './create-style-definition'

export {
    expandShape,
    type CSSVariableProvider,
    type ShapeScalarValue,
    type ShapeCornersObject,
    type ShapeStateTuple,
    type ShapeStateRecord,
    type ShapeValueInput,
    type CleanShapePrefix,
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
    type CleanPaddingPrefix,
    type NormalizePaddingPrefix,
    type PaddingEdgeSuffix,
    type PaddingTokenKey,
    type IsPaddingObject,
    type ExtractSinglePaddingValue,
    type ExtractPaddingEdgeValue,
    type ExpandedPaddingResult
} from './expand-padding'

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
    type CleanMarginPrefix,
    type NormalizeMarginPrefix,
    type MarginEdgeSuffix,
    type MarginTokenKey,
    type IsMarginObject,
    type ExtractSingleMarginValue,
    type ExtractMarginEdgeValue,
    type ExpandedMarginResult
} from './expand-margin'

export {
    expandTypescale,
    type MDKTypescaleLike,
    type TypographyObject,
    type SingleTypescaleValue,
    type TypescaleTuple,
    type TypescaleRecord,
    type TypescaleValueInput,
    type CleanTypescalePrefix,
    type NormalizeTypescalePrefix,
    type TypescalePropSuffix,
    type TypescaleTokenKey,
    type ExtractFont,
    type ExtractLeading,
    type ExtractSize,
    type ExtractTracking,
    type ExtractWeight,
    type ExpandedTypescaleResult,
    type ExpandedTypescaleTokens,
    type ExtractedTypography
} from './expand-typescale'

export {
    stringifyTokens,
    type StringifyTokensOptions,
    type StringifyPrefixOrOptions
} from './stringify-tokens'

export {
    overrideTokens,
    overrideComponentTokens,
    stringTokens,
    type OverrideTokensOptions
} from './override-tokens'
