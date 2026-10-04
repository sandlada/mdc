/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Style definition for the `mdc-tabs` container.
 *
 * The container itself is a transparent flex row; the only themed surface it
 * paints is the trailing divider that separates the tab bar from the content
 * below it.
 *
 * @link
 * https://m3.material.io/components/tabs/overview
 */
import { Color } from '../../utils/color'
import { createStyleDefinition, defineSchema } from '@sandlada/styles/schema'

export const TabsSchema = defineSchema(['enabled'] as const)

interface ITabsScheme {
    'enabled-container-color': string
    'enabled-divider-color': string
    'divider-height': string
}

export const TabsDefinition = createStyleDefinition({
    'enabled-container-color': `transparent`,
    'enabled-divider-color': Color.OutlineVariant,
    'divider-height': `1px`,
})
