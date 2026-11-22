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

const ComponentFamilies = [
    { Id: 'navigation', Label: 'Navigation', Members: ['navigation-bar', 'navigation-drawer', 'navigation-rail', 'navigation-tab'] },
    { Id: 'app-bars', Label: 'App Bars', Members: ['appbar', 'bottom-appbar'] },
    { Id: 'buttons', Label: 'Buttons', Members: ['button', 'button-group', 'icon-button', 'segmented-button', 'split-button'] },
    { Id: 'fabs', Label: 'FABs', Members: ['fab', 'fab-menu'] },
    { Id: 'menus', Label: 'Menus', Members: ['context-menu', 'menu'] },
    { Id: 'sheets', Label: 'Sheets', Members: ['bottom-sheet', 'side-sheet'] },
    { Id: 'scaffolds', Label: 'Scaffolds', Members: ['pane-scaffold', 'scaffold'] },
    { Id: 'sliders', Label: 'Sliders', Members: ['legacy-slider', 'slider'] },
    { Id: 'progress-indicators', Label: 'Progress Indicators', Members: ['expressive-progress-indicator', 'progress-indicator', 'wavy-progress-indicator'] },
    { Id: 'tooltips', Label: 'Tooltips', Members: ['tooltip', 'tooltip-box'] },
] as const

export interface ComponentGroup {
    id: string
    label: string
    entries: ComponentEntry[]
}

const Groups = ComponentFamilies.map(({ Id, Label, Members }) => {
    const members = new Set<string>(Members)
    return { id: Id, label: Label, entries: RegularComponents.filter((entry) => members.has(entry.name)) }
}).filter(({ entries }) => entries.length > 1)

export const ComponentGroupByName = new Map(
    Groups.flatMap((group) => group.entries.map((entry) => [entry.name, group] as const)),
)

export const ComponentNavigation = RegularComponents.flatMap<ComponentEntry | ComponentGroup>((entry) => {
    const group = ComponentGroupByName.get(entry.name)
    if (group === undefined) return [entry]
    return group.entries[0] === entry ? [group] : []
})
