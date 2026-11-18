/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */

import { Components, type ComponentEntry } from 'virtual:mdc-manifest'

export { Components, type ComponentEntry }

export const BaseComponentOrder = [
    'attachable-controller',
    'divider',
    'elevation',
    'focus-ring',
    'ripple',
    'badge',
    'icon',
    'typography',
]

const ByName = new Map(Components.map((c) => [c.name, c]))

export const BaseComponents: ComponentEntry[] = BaseComponentOrder
    .map((name) => ByName.get(name))
    .filter((c): c is ComponentEntry => c !== undefined)

const Excluded = new Set([...BaseComponentOrder])

export const RegularComponents: ComponentEntry[] = Components.filter((c) => !Excluded.has(c.name))
