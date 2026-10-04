/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { createStyleDefinition, defineSchema } from '@sandlada/styles/schema'

export const SnackbarHostSchema = defineSchema(['enabled'] as const)

export const SnackbarHostDefinition = createStyleDefinition({
    'enabled-container-margin-inline-start': `16px`,
    'enabled-container-margin-inline-end'  : `16px`,
    'enabled-container-margin-block-start' : `16px`,
    'enabled-container-margin-block-end'   : `16px`,
    'enabled-container-max-width'          : `560px`,
    'enabled-z-index'                      : `5000`,
})
