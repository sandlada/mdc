/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { MDCScaffold } from './scaffold'
import {
    computeScaffoldBottomOffsets,
    isScaffoldFabCentered,
    isScaffoldFabOverlay,
    normalizeScaffoldFabPosition,
    resolveScaffoldHeightMode,
    resolveScaffoldLayoutMode,
    resolveScaffoldNavigationType,
    ScaffoldBreakpoints,
    ScaffoldHeightBreakpoints,
} from './scaffold.interface'
import { ScaffoldDefinition } from './scaffold.definition'

describe('MDCScaffold', () => {
    it('initializes with default properties', () => {
        const el = new MDCScaffold()
        expect(el.railLayout).toBe('full-height')
        expect(el.fabPosition).toBe('end')
        expect(el.scrollMode).toBe('body')
        expect(el.layoutMode).toBe('auto')
        expect(el.adaptiveNavigation).toBe('auto')
        expect(el.contentPaddingMode).toBe('inset')
        expect(el.effectiveLayoutMode).toBe('compact')
        expect(el.effectiveHeightMode).toBe('medium')
        expect(el.effectiveNavigationType).toBe('none')
        expect(el.avoidSafeArea).toBe(false)
        expect(el.hasAppbar).toBe(false)
        expect(el.hasRail).toBe(false)
        expect(el.hasDrawer).toBe(false)
        expect(el.hasEndRail).toBe(false)
        expect(el.hasEndDrawer).toBe(false)
        expect(el.hasBottomBar).toBe(false)
        expect(el.hasBottomSheet).toBe(false)
        expect(el.hasFab).toBe(false)
        expect(el.hasSnackbarHost).toBe(false)
    })

    it('allows updating properties', () => {
        const el = new MDCScaffold()
        el.railLayout = 'below-appbar'
        el.fabPosition = 'center'
        el.scrollMode = 'window'
        el.layoutMode = 'compact'
        el.adaptiveNavigation = 'off'
        el.contentPaddingMode = 'manual'
        el.avoidSafeArea = true
        expect(el.railLayout).toBe('below-appbar')
        expect(el.fabPosition).toBe('center')
        expect(el.scrollMode).toBe('window')
        expect(el.layoutMode).toBe('compact')
        expect(el.adaptiveNavigation).toBe('off')
        expect(el.contentPaddingMode).toBe('manual')
        expect(el.avoidSafeArea).toBe(true)
    })

    it('supports extended layout modes', () => {
        const el = new MDCScaffold()
        el.layoutMode = 'large'
        expect(el.layoutMode).toBe('large')
        el.layoutMode = 'extra-large'
        expect(el.layoutMode).toBe('extra-large')
        el.layoutMode = 'medium'
        expect(el.layoutMode).toBe('medium')
        el.layoutMode = 'expanded'
        expect(el.layoutMode).toBe('expanded')
    })

    it('exposes inner padding measurements without throwing in Node', () => {
        const el = new MDCScaffold()
        expect(el.getInnerPadding()).toEqual({ top: 0, bottom: 0, left: 0, right: 0 })
        expect(() => el.refreshLayout()).not.toThrow()
    })
})

describe('resolveScaffoldLayoutMode (MD3 width window size classes)', () => {
    it('mirrors Android WIDTH_DP lower bounds', () => {
        expect(ScaffoldBreakpoints.Medium).toBe(600)
        expect(ScaffoldBreakpoints.Expanded).toBe(840)
        expect(ScaffoldBreakpoints.Large).toBe(1200)
        expect(ScaffoldBreakpoints.ExtraLarge).toBe(1600)
    })

    it('resolves compact below 600', () => {
        expect(resolveScaffoldLayoutMode(0)).toBe('compact')
        expect(resolveScaffoldLayoutMode(320)).toBe('compact')
        expect(resolveScaffoldLayoutMode(599)).toBe('compact')
    })

    it('resolves medium from 600 to 839', () => {
        expect(resolveScaffoldLayoutMode(600)).toBe('medium')
        expect(resolveScaffoldLayoutMode(700)).toBe('medium')
        expect(resolveScaffoldLayoutMode(839)).toBe('medium')
    })

    it('resolves expanded from 840 to 1199', () => {
        expect(resolveScaffoldLayoutMode(840)).toBe('expanded')
        expect(resolveScaffoldLayoutMode(1024)).toBe('expanded')
        expect(resolveScaffoldLayoutMode(1199)).toBe('expanded')
    })

    it('resolves large from 1200 to 1599', () => {
        expect(resolveScaffoldLayoutMode(1200)).toBe('large')
        expect(resolveScaffoldLayoutMode(1440)).toBe('large')
        expect(resolveScaffoldLayoutMode(1599)).toBe('large')
    })

    it('resolves extra-large at 1600 and above', () => {
        expect(resolveScaffoldLayoutMode(1600)).toBe('extra-large')
        expect(resolveScaffoldLayoutMode(2560)).toBe('extra-large')
    })

    it('falls back to compact for non-finite widths', () => {
        expect(resolveScaffoldLayoutMode(Number.NaN)).toBe('compact')
        expect(resolveScaffoldLayoutMode(Number.NEGATIVE_INFINITY)).toBe('compact')
        expect(resolveScaffoldLayoutMode(Number.POSITIVE_INFINITY)).toBe('compact')
    })
})

describe('resolveScaffoldHeightMode (MD3 height window size classes)', () => {
    it('mirrors Android HEIGHT_DP lower bounds', () => {
        expect(ScaffoldHeightBreakpoints.Medium).toBe(480)
        expect(ScaffoldHeightBreakpoints.Expanded).toBe(900)
    })

    it('resolves compact below 480, medium 480..899, expanded >= 900', () => {
        expect(resolveScaffoldHeightMode(0)).toBe('compact')
        expect(resolveScaffoldHeightMode(479)).toBe('compact')
        expect(resolveScaffoldHeightMode(480)).toBe('medium')
        expect(resolveScaffoldHeightMode(899)).toBe('medium')
        expect(resolveScaffoldHeightMode(900)).toBe('expanded')
        expect(resolveScaffoldHeightMode(Number.NaN)).toBe('compact')
    })
})

describe('resolveScaffoldNavigationType (NavigationSuiteScaffoldDefaults parity)', () => {
    const allSlots = { hasDrawer: true, hasRail: true, hasNavigationBar: true }

    it('returns none when no navigation slots are present', () => {
        expect(resolveScaffoldNavigationType('expanded', 'medium', {})).toBe('none')
    })

    it('prefers navigation-bar when width is compact or height is compact', () => {
        expect(resolveScaffoldNavigationType('compact', 'expanded', allSlots)).toBe('navigation-bar')
        expect(resolveScaffoldNavigationType('expanded', 'compact', allSlots)).toBe('navigation-bar')
    })

    it('prefers navigation-rail for medium and expanded widths when height >= 480', () => {
        expect(resolveScaffoldNavigationType('medium', 'medium', allSlots)).toBe('navigation-rail')
        expect(resolveScaffoldNavigationType('expanded', 'expanded', allSlots)).toBe('navigation-rail')
    })

    it('prefers navigation-drawer for large and extra-large widths when drawer is present', () => {
        expect(resolveScaffoldNavigationType('large', 'medium', allSlots)).toBe('navigation-drawer')
        expect(resolveScaffoldNavigationType('extra-large', 'expanded', allSlots)).toBe('navigation-drawer')
        expect(resolveScaffoldNavigationType('large', 'medium', { hasRail: true, hasNavigationBar: true })).toBe('navigation-rail')
    })
})

describe('normalizeScaffoldFabPosition (Compose FabPosition parity)', () => {
    it('preserves canonical Android FabPosition values', () => {
        expect(normalizeScaffoldFabPosition('start')).toBe('start')
        expect(normalizeScaffoldFabPosition('center')).toBe('center')
        expect(normalizeScaffoldFabPosition('end')).toBe('end')
        expect(normalizeScaffoldFabPosition('end-overlay')).toBe('end-overlay')
    })

    it('falls back to end (FabPosition.End default) for unknown values', () => {
        expect(normalizeScaffoldFabPosition(undefined)).toBe('end')
        expect(normalizeScaffoldFabPosition(null)).toBe('end')
        expect(normalizeScaffoldFabPosition('')).toBe('end')
        expect(normalizeScaffoldFabPosition('top-start')).toBe('end')
    })

    it('classifies centered and overlay placements', () => {
        expect(isScaffoldFabCentered('center')).toBe(true)
        expect(isScaffoldFabCentered('end')).toBe(false)
        expect(isScaffoldFabOverlay('end-overlay')).toBe(true)
        expect(isScaffoldFabOverlay('end')).toBe(false)
    })
})

describe('computeScaffoldBottomOffsets (Android ScaffoldLayout parity)', () => {
    const base = {
        fabSpacing     : 16,
        snackbarSpacing: 16,
    }

    it('places snackbar at snackbarSpacing with safe-area when neither bar nor FAB is present', () => {
        expect(computeScaffoldBottomOffsets({
            ...base,
            hasFab         : false,
            fabHeight      : 0,
            fabPosition    : 'end',
            hasBottomBar   : false,
            bottomBarHeight: 0,
        })).toEqual({
            fabBottom             : 0,
            snackbarBottom        : 16,
            fabUsesSafeBottom     : false,
            snackbarUsesSafeBottom: true,
        })
    })

    it('stacks snackbar above bottom bar without double-counting bottom safe inset', () => {
        expect(computeScaffoldBottomOffsets({
            ...base,
            hasFab         : false,
            fabHeight      : 0,
            fabPosition    : 'end',
            hasBottomBar   : true,
            bottomBarHeight: 80,
        })).toEqual({
            fabBottom             : 0,
            snackbarBottom        : 96,
            fabUsesSafeBottom     : false,
            snackbarUsesSafeBottom: false,
        })
    })

    it('stacks FAB above bottom bar and snackbar above FAB', () => {
        expect(computeScaffoldBottomOffsets({
            ...base,
            hasFab         : true,
            fabHeight      : 56,
            fabPosition    : 'end',
            hasBottomBar   : true,
            bottomBarHeight: 80,
        })).toEqual({
            fabBottom             : 96,
            snackbarBottom        : 168,
            fabUsesSafeBottom     : false,
            snackbarUsesSafeBottom: false,
        })
    })

    it('handles end-overlay when bottom bar is taller than FAB + spacing', () => {
        expect(computeScaffoldBottomOffsets({
            ...base,
            hasFab         : true,
            fabHeight      : 56,
            fabPosition    : 'end-overlay',
            hasBottomBar   : true,
            bottomBarHeight: 80,
        })).toEqual({
            fabBottom             : 16,
            snackbarBottom        : 96,
            fabUsesSafeBottom     : true,
            snackbarUsesSafeBottom: false,
        })
    })

    it('handles end-overlay when FAB + spacing is taller than bottom bar', () => {
        expect(computeScaffoldBottomOffsets({
            ...base,
            hasFab         : true,
            fabHeight      : 56,
            fabPosition    : 'end-overlay',
            hasBottomBar   : true,
            bottomBarHeight: 48,
        })).toEqual({
            fabBottom             : 16,
            snackbarBottom        : 88,
            fabUsesSafeBottom     : true,
            snackbarUsesSafeBottom: true,
        })
    })
})

describe('ScaffoldDefinition (Android ScaffoldDefaults parity)', () => {
    it('uses 16px FAB and snackbar spacing', () => {
        const tokens = (ScaffoldDefinition as unknown as { tokens: Record<string, unknown> }).tokens
        expect(tokens['enabled-fab-spacing']).toBe('16px')
        expect(tokens['enabled-snackbar-spacing']).toBe('16px')
        expect(tokens['enabled-fab-margin-inline-end']).toBe('16px')
        expect(tokens['enabled-fab-margin-block-end']).toBe('16px')
    })

    it('orders z-indices appbar <= bottom-bar < drawer < fab < snackbar-host < bottom-sheet', () => {
        const tokens = (ScaffoldDefinition as unknown as { tokens: Record<string, unknown> }).tokens
        const z = (key: string): number => Number(tokens[key])
        expect(z('enabled-z-index-appbar')).toBeLessThanOrEqual(z('enabled-z-index-bottom-bar'))
        expect(z('enabled-z-index-bottom-bar')).toBeLessThan(z('enabled-z-index-drawer'))
        expect(z('enabled-z-index-drawer')).toBeLessThan(z('enabled-z-index-fab'))
        expect(z('enabled-z-index-fab')).toBeLessThan(z('enabled-z-index-snackbar-host'))
        expect(z('enabled-z-index-snackbar-host')).toBeLessThan(z('enabled-z-index-bottom-sheet'))
    })
})
