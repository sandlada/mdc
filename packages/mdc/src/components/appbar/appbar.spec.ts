/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest'
import { LitElement } from 'lit'
import { composeMixin } from '../../utils/compose-mixin/compose-mixin'
import { BaseAppBar } from './internal/base-appbar'
import { MDCAppBar } from './appbar'
import { AppBarVariant, AppBarAlignment } from './appbar.interface'

class TestAppBar extends BaseAppBar {}

describe('BaseAppBar', () => {
    it('has correct default properties', () => {
        const appbar = new TestAppBar()
        expect(appbar.variant).toBe(AppBarVariant.Small)
        expect(appbar.alignment).toBe(AppBarAlignment.Start)
        expect(appbar.headline).toBe('')
        expect(appbar.subtitle).toBe('')
        expect(appbar.scrolled).toBe(false)
        expect(appbar.scrollTarget).toBe(null)
        expect(appbar.ignoreGlobalConfig).toBe(false)
        expect(appbar.disableElevation).toBe(false)
    })

    it('allows updating every property', () => {
        const appbar = new TestAppBar()
        appbar.variant = AppBarVariant.Search
        appbar.alignment = AppBarAlignment.Center
        appbar.headline = 'Title'
        appbar.subtitle = 'Subtitle'
        appbar.scrolled = true
        appbar.scrollTarget = 'window'
        appbar.ignoreGlobalConfig = true
        appbar.disableElevation = true
        expect(appbar.variant).toBe(AppBarVariant.Search)
        expect(appbar.alignment).toBe(AppBarAlignment.Center)
        expect(appbar.headline).toBe('Title')
        expect(appbar.subtitle).toBe('Subtitle')
        expect(appbar.scrolled).toBe(true)
        expect(appbar.scrollTarget).toBe('window')
        expect(appbar.ignoreGlobalConfig).toBe(true)
        expect(appbar.disableElevation).toBe(true)
    })
})

describe('MDCAppBar', () => {
    it('has correct default properties', () => {
        const appbar = new MDCAppBar()
        expect(appbar.variant).toBe(AppBarVariant.Small)
        expect(appbar.alignment).toBe(AppBarAlignment.Start)
        expect(appbar.headline).toBe('')
        expect(appbar.subtitle).toBe('')
        expect(appbar.scrolled).toBe(false)
        expect(appbar.scrollTarget).toBe(null)
    })
})