/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Tokens layer of @sandlada/styles: token forwarding, stringification, overrides, and CSS expansion macros.
 */

export {
    forwardTokens,
    type ForwardTokenKey,
    type ForwardTokensOptions,
    type ForwardedTokensResult
} from './forward-tokens'

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
    overrideTokens,
    overrideComponentTokens,
    stringTokens,
    type OverrideTokensOptions
} from './override-tokens'

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
} from './expand-margin'

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
