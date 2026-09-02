/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { createStyleDefinition as createStyleDef } from '../styles/create-style-definition'
import { defineSchema } from '../styles/define-schema'

export * from '../styles/create-style-definition'

export function createStyleDefinition<T = any>(schemaOrTokens: any): any {
    if (schemaOrTokens && typeof schemaOrTokens === 'object' && schemaOrTokens.__brand === 'StateSchema') {
        return createStyleDef(schemaOrTokens)
    }
    const defaultSchema = defineSchema(['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const)
    return createStyleDef(defaultSchema)(schemaOrTokens)
}
