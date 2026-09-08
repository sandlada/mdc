/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 *
 * @fileoverview
 * Demo state schema (single size dimension, badge-proven shape).
 */

import { defineSchema } from '@sandlada/styles/define-schema'

export const DemoSchema = defineSchema([
    ['small', 'large'],
] as const)
