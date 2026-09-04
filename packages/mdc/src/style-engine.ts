/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Node-safe pure style engine entry for tooling (e.g. `@sandlada/vscode-mdc`).
 *
 * Intentionally excludes DOM-bound modules (`create-style-sheet`,
 * `define-variant-tokens`, `stringify-tokens`, `override-tokens`) which pull
 * `lit` runtime (`unsafeCSS` -> `reactive-element` -> `HTMLElement`) and crash
 * in a plain Node extension host. Everything re-exported here imports only
 * types or pure logic and is safe to bundle into VS Code extensions and TS
 * server plugins.
 */

export {
    defineSchema,
    type StateSchema
} from './utils/styles/define-schema'

export {
    createStyleDefinition,
    FORWARDED_TOKEN_META,
    type PrimitiveTokenValue,
    type StateTuple,
    type StateRecord,
    type TokenValue,
    type ForwardedTokenMeta,
    type ResolvedStyleDefinition
} from './utils/styles/create-style-definition'

export {
    forwardTokens,
    type ForwardTokenKey,
    type ForwardTokensOptions,
    type ForwardedTokensResult
} from './utils/styles/forward-tokens'

export {
    hostTrigger,
    type TriggerTarget,
    type TriggerContext,
    type ResolvedTrigger,
    type StateTrigger
} from './utils/styles/host-trigger'

export {
    selfTrigger
} from './utils/styles/self-trigger'

export {
    mapStateTriggers,
    StateTriggerRegistry
} from './utils/styles/map-state-triggers'

export {
    pipe
} from './utils/styles/pipe'

export {
    compileStateSheet,
    extractStateTokenMetadata,
    canonicalizeState,
    splitSelectorByComma,
    extractHostAndDescendant,
    appendToHostSelector,
    composeStateSelector,
    matchVariants,
    type ASTNode,
    type DeclarationNode,
    type StyleRuleNode,
    type WrapperAtRuleNode,
    type KeyframeStepNode,
    type KeyframesNode,
    type CompileStateSheetOptions,
    type StateTokenMetadata,
    type ComposeSelectorOptions
} from './utils/styles/state-sheet-compiler'

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
} from './utils/styles/expand-shape'

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
} from './utils/styles/expand-padding'

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
} from './utils/styles/expand-typescale'
