/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import {
    PaneScaffoldDockedEdge, PaneScaffoldPattern, type IPaneScaffoldDestination, type IPaneScaffoldSavedFloatingSize,
    type IPaneScaffoldExpansionPosition, type PaneExpansionAnchorType, type PaneScaffoldRole, type PaneScaffoldSavedExpansion,
} from '../pane-scaffold.interface'
import { paneExpansionLayoutKey, PaneRoles, PendingExpansionKeyPrefix, SharedExpansionKeyPrefix, validateExpansion } from './pane-state'

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

const parseKey = (key: string): [PaneScaffoldPattern, string, string | undefined] => {
    const [pattern, roles, edge, extra] = key.split(':')
    if (!Object.values(PaneScaffoldPattern).includes(pattern as PaneScaffoldPattern) || !roles || extra !== undefined) {
        throw new Error('Invalid pane snapshot key')
    }
    return [pattern as PaneScaffoldPattern, roles, edge]
}

const layoutRoleCount = (key: string): number => {
    if (key.startsWith(SharedExpansionKeyPrefix)) {
        if (!key.slice(SharedExpansionKeyPrefix.length).trim()) throw new Error('Invalid shared pane snapshot key')
        return 2
    }
    const [pattern, roles, edge] = parseKey(key)
    const panes: readonly string[] = PaneRoles[pattern]
    const selected = roles.split(',')
    if (edge !== undefined || selected.length < 2 || new Set(selected).size !== selected.length
        || !selected.every(role => panes.includes(role))) throw new Error('Invalid pane snapshot layout')
    return selected.length
}

const parseEntries = <T>(parse: (key: string, raw: unknown) => T) => (entries: unknown): Map<string, T> => {
    if (!Array.isArray(entries)) throw new Error('Invalid pane snapshot entries')
    const parsed = new Map<string, T>()
    for (const entry of entries) {
        if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || parsed.has(entry[0])) {
            throw new Error('Invalid pane snapshot entry')
        }
        parsed.set(entry[0], parse(entry[0], entry[1]))
    }
    return parsed
}

const parseProportions = parseEntries<number[]>((key, raw) => {
    const proportions = Array.isArray(raw) ? [...raw] : []
    if (proportions.length !== layoutRoleCount(key)
        || !proportions.every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1)
        || Math.abs(proportions.reduce((sum, value) => sum + value, 0) - 1) > 1e-6) {
        throw new Error('Invalid pane snapshot proportions')
    }
    return proportions
})

const parseExpansionPosition = (raw: unknown): IPaneScaffoldExpansionPosition => {
    if (!isRecord(raw)) throw new Error('Invalid pane snapshot expansion position')
    const { type, value } = raw
    if (typeof value !== 'number' || typeof type !== 'string') throw new Error('Invalid pane snapshot expansion position')
    const anchorType = type as PaneExpansionAnchorType
    validateExpansion(anchorType, value)
    return { type: anchorType, value }
}

const parseExpansions = parseEntries<PaneScaffoldSavedExpansion>((key, raw) => {
    if (key.startsWith(PendingExpansionKeyPrefix)) {
        if (!Object.hasOwn(PaneRoles, key.slice(PendingExpansionKeyPrefix.length))) throw new Error('Invalid pending pane snapshot key')
        return parseExpansionPosition(raw)
    }
    if (layoutRoleCount(key) !== 2 || !isRecord(raw)) throw new Error('Invalid pane snapshot expansion')
    const { anchor, requested } = raw
    if (typeof anchor === 'string' && anchor.trim()) {
        return requested === undefined ? { anchor } : { anchor, requested: parseExpansionPosition(requested) }
    }
    return parseExpansionPosition(raw)
})

const parseFloatingSizes = parseEntries<IPaneScaffoldSavedFloatingSize>((key, raw) => {
    const [pattern, role, edge] = parseKey(key)
    const panes: readonly string[] = PaneRoles[pattern]
    if (!panes.includes(role) || !Object.values(PaneScaffoldDockedEdge).includes(edge as PaneScaffoldDockedEdge) || !isRecord(raw)) {
        throw new Error('Invalid pane snapshot floating size')
    }
    const { mode, partial } = raw
    if ((mode !== 'partial' && mode !== 'expanded' && mode !== 'collapsed')
        || (partial !== undefined && (typeof partial !== 'number' || !Number.isFinite(partial) || partial < 0))) {
        throw new Error('Invalid pane snapshot floating resize state')
    }
    return { mode, partial }
})

const normalizeExpansionKeys = (proportions: Map<string, number[]>, expansions: Map<string, PaneScaffoldSavedExpansion>) => {
    const inputs = new Set([...proportions.keys(), ...expansions.keys()])
    const selected = new Map<string, string>()
    for (const key of inputs) {
        let normalized = key
        if (!key.startsWith(SharedExpansionKeyPrefix) && !key.startsWith(PendingExpansionKeyPrefix)) {
            const [pattern, roles] = parseKey(key)
            normalized = paneExpansionLayoutKey(pattern)(roles.split(',') as PaneScaffoldRole[])
        }
        if (key === normalized || !selected.has(normalized)) selected.set(normalized, key)
    }
    const normalizedProportions = new Map<string, number[]>()
    const normalizedExpansions = new Map<string, PaneScaffoldSavedExpansion>()
    for (const [normalized, key] of selected) {
        const widths = proportions.get(key)
        const expansion = expansions.get(key)
        if (widths) normalizedProportions.set(normalized, widths)
        if (expansion) normalizedExpansions.set(normalized, expansion)
    }
    return { proportions: normalizedProportions, expansions: normalizedExpansions }
}

export const parsePaneSnapshot = (raw: unknown) => {
    if (!isRecord(raw)) throw new Error('Invalid pane snapshot')
    const { version, pattern: rawPattern, history: rawHistory, proportions, expansions, floatingSizes } = raw
    if (version !== 1 || !Object.values(PaneScaffoldPattern).includes(rawPattern as PaneScaffoldPattern)
        || !Array.isArray(rawHistory) || !rawHistory.length) {
        throw new Error('Invalid pane snapshot')
    }
    const pattern = rawPattern as PaneScaffoldPattern
    const roles: readonly string[] = PaneRoles[pattern]
    const history: IPaneScaffoldDestination[] = Array.from(rawHistory, item => {
        if (!isRecord(item)) throw new Error('Invalid pane snapshot destination')
        const { pane, contentKey } = item
        if (typeof pane !== 'string' || !roles.includes(pane) || (contentKey !== undefined && typeof contentKey !== 'string')) {
            throw new Error('Invalid pane snapshot destination')
        }
        return { pane: pane as PaneScaffoldRole, contentKey }
    })
    return {
        pattern, history,
        ...normalizeExpansionKeys(parseProportions(proportions), parseExpansions(expansions)),
        floatingSizes: parseFloatingSizes(floatingSizes),
    }
}
