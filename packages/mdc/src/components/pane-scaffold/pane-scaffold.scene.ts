/**
 * @version 2026.11.21
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { findBackDestination, PaneRoles, resolveDirective, resolvePaneLayout } from './internal'
import {
    PaneScaffoldBackNavigationBehavior, PaneScaffoldPattern, type IPaneScaffoldDestination, type IPaneScaffoldScene,
    type IPaneSceneEntry, type IPaneSceneOptions, type PaneScaffoldPreferredSize, type PaneScaffoldRole,
} from './pane-scaffold.interface'

/** Resolves the active adaptive scene from an application-owned navigation stack. */
export const resolvePaneScaffoldScene = (options: IPaneSceneOptions) =>
    <T extends IPaneSceneEntry>(entries: readonly T[]): IPaneScaffoldScene<T> | undefined => {
        const last = entries.at(-1)?.pane
        if (!last) return undefined
        const { pattern, sceneKey: key } = last
        if (!Object.hasOwn(PaneRoles, pattern) || typeof key !== 'string' || !key.length) throw new Error('Invalid pane scene metadata')
        const roles: readonly PaneScaffoldRole[] = PaneRoles[pattern]
        const matching: { entry: T; index: number; pane: NonNullable<IPaneSceneEntry['pane']> }[] = []
        for (let index = entries.length - 1; index >= 0; index--) {
            const entry = entries[index]
            const pane = entry.pane
            if (!pane || pane.pattern !== pattern) break
            if (pane.sceneKey !== key) continue
            if (!roles.includes(pane.role) || typeof entry.key !== 'string' || !entry.key.length) {
                throw new Error('Invalid pane scene entry')
            }
            if (pane.hasDetailPlaceholder !== undefined
                && (pane.role !== 'list' || typeof pane.hasDetailPlaceholder !== 'boolean')) {
                throw new Error('A detail placeholder flag must be a boolean on a list route')
            }
            matching.push({ entry, index, pane })
        }
        matching.reverse()

        const history: IPaneScaffoldDestination[] = matching.map(({ entry, pane }) => ({ pane: pane.role, contentKey: entry.key }))
        const adaptStrategies = options.adaptStrategies ?? {}
        const hasDetailPlaceholderAt = (index: number) => pattern === PaneScaffoldPattern.ListDetail
            && (matching.slice(0, index + 1).findLast(({ pane }) => pane.role === 'list')?.pane.hasDetailPlaceholder
                ?? Boolean(options.hasDetailPlaceholder))
        const hasDetailPlaceholder = hasDetailPlaceholderAt(history.length - 1)
        const baseDirective = options.layoutDirective
        const resolvedDirective = resolveDirective(options.width, options.height)(baseDirective)
        const layoutAt = (index: number) => {
            const historyRoles = history.slice(0, index + 1).map(destination => destination.pane)
            const present = new Set(historyRoles)
            if (hasDetailPlaceholderAt(index) && present.has('list')) present.add('detail')
            return resolvePaneLayout(pattern, resolvedDirective, adaptStrategies, historyRoles, baseDirective?.paneOrder)(present)
        }
        const { expanded, reflowed, levitated } = layoutAt(history.length - 1)
        if (!options.shouldHandleSinglePaneLayout && expanded.length + Number(Boolean(reflowed)) + Number(Boolean(levitated)) <= 1) {
            return undefined
        }

        const paneEntriesAt = (end: number) => {
            const result: Partial<Record<PaneScaffoldRole, T>> = {}
            for (const { entry, pane } of matching.slice(0, end + 1)) result[pane.role] = entry
            return result
        }
        const directiveFor = (paneEntries: ReturnType<typeof paneEntriesAt>) => {
            const preferredWidths: Partial<Record<PaneScaffoldRole, PaneScaffoldPreferredSize>> = { ...baseDirective?.preferredWidths }
            const preferredHeights: Partial<Record<PaneScaffoldRole, PaneScaffoldPreferredSize>> = { ...baseDirective?.preferredHeights }
            for (const role of roles) {
                const metadata = paneEntries[role]?.pane
                if (metadata?.preferredWidth !== undefined) preferredWidths[role] = metadata.preferredWidth
                if (metadata?.preferredHeight !== undefined) preferredHeights[role] = metadata.preferredHeight
            }
            const directive = { ...baseDirective, preferredWidths, preferredHeights }
            resolveDirective(options.width, options.height)(directive)
            return directive
        }
        const paneEntries = paneEntriesAt(history.length - 1)
        const directive = directiveFor(paneEntries)

        const backNavigationBehavior = options.backNavigationBehavior ?? (pattern === PaneScaffoldPattern.SupportingPane
            ? PaneScaffoldBackNavigationBehavior.PopUntilCurrentDestinationChange
            : PaneScaffoldBackNavigationBehavior.PopUntilScaffoldValueChange)
        const signatureAt = (index: number) => {
            const layout = layoutAt(index)
            return `${layout.expanded.join()}/${layout.reflowed?.pane ?? ''}/${layout.levitated?.pane ?? ''}`
        }
        const relative = findBackDestination(backNavigationBehavior, signatureAt)(history)
        const matchingIndices = new Set(matching.map(entry => entry.index))
        const target = relative < 0 ? matching[0].index - 1 : matching[relative].index
        let previous = entries.length - 2
        while (previous > target && matchingIndices.has(previous)) previous--
        const previousSceneIndex = previous === target && relative >= 0 ? relative : undefined
        return {
            key, pattern, history, paneEntries, directive, adaptStrategies, backNavigationBehavior,
            hasDetailPlaceholder,
            detailPlaceholder: Boolean(hasDetailPlaceholder && paneEntries.list && !paneEntries.detail),
            value: { destination: history[history.length - 1], expandedPanes: expanded, reflowedPane: reflowed, levitatedPane: levitated?.pane },
            previousEntries: entries.slice(0, previous + 1),
            previousSceneIndex,
            previousDirective: previousSceneIndex === undefined ? undefined : directiveFor(paneEntriesAt(previousSceneIndex)),
            previousHasDetailPlaceholder: previousSceneIndex === undefined ? undefined : hasDetailPlaceholderAt(previousSceneIndex),
        }
    }
