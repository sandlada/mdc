/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Schema layer of @sandlada/styles: state schema definitions, style definition creators, and trigger tables.
 */

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
    type TokenValueForSchema,
    type EffectiveDimensions,
    type NDArrayValue,
    type NDJointArray,
    type NDTokenArray,
    type ForwardedTokenMeta,
    type ResolvedStyleDefinition
} from './create-style-definition'

export {
    emptyTables,
    isTriggerTables,
    resolveState,
    resolveVariant,
    withState,
    withVariant,
    type ResolvedTrigger,
    type TriggerContext,
    type TriggerTables,
    type TriggerTarget
} from './triggers'
