/**
 * @license
 * Copyright 2026 Kai-Orion & Sandlada
 * SPDX-License-Identifier: MIT
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MDCNavigationTab } from './navigation-tab'
import { NavigationTabVariant } from './navigation-tab.interface'
import {
    captureNavigationTabSnapshot,
    runNavigationTabTransitions,
    type INavigationTabMotionElements,
    type INavigationTabMotionState,
} from './internal/navigation-tab-motion'

interface IMockAnimationCall {
    target   : HTMLElement
    keyframes: Keyframe[]
    options  : KeyframeAnimationOptions | number | undefined
}

function createMockElement(
    name: string,
    options: {
        rect?  : { left: number; top: number; width: number; height: number }
        style? : Record<string, string>
        onAnim?: (call: IMockAnimationCall) => void
        tracker?: Animation[]
    } = {},
): HTMLElement {
    const el = {
        tagName: name,
        getBoundingClientRect: vi.fn(() => options.rect ?? { left: 0, top: 0, width: 0, height: 0 }),
        animate: vi.fn((keyframes: Keyframe[], animOptions?: KeyframeAnimationOptions) => {
            const target = el as unknown as HTMLElement
            options.onAnim?.({ target, keyframes, options: animOptions })
            const listeners = new Map<string, Array<() => void>>()
            const anim = {
                effect     : { target },
                playState  : 'running',
                cancel     : vi.fn(() => {
                    ;(anim as { playState: AnimationPlayState }).playState = 'idle'
                    listeners.get('cancel')?.forEach((fn) => fn())
                }),
                finish     : vi.fn(() => {
                    ;(anim as { playState: AnimationPlayState }).playState = 'finished'
                    listeners.get('finish')?.forEach((fn) => fn())
                }),
                addEventListener: vi.fn((type: string, fn: () => void) => {
                    const list = listeners.get(type) ?? []
                    list.push(fn)
                    listeners.set(type, list)
                }),
                finished: Promise.resolve(),
            } as unknown as Animation
            options.tracker?.push(anim)
            return anim
        }),
        __mockStyle: options.style ?? {},
    } as unknown as HTMLElement
    return el
}

class TestNavigationTab extends MDCNavigationTab {
    public mockElements!: INavigationTabMotionElements

    protected override getMotionElements(): INavigationTabMotionElements {
        return this.mockElements
    }

    public runWillUpdate(changed: Map<string, unknown>): void {
        this.willUpdate(changed as never)
    }

    public runUpdated(changed: Map<string, unknown>): void {
        this.updated(changed as never)
    }
}

describe('MDCNavigationTab', () => {
    it('has correct default properties', () => {
        const tab = new MDCNavigationTab()
        expect(tab.label).toBe('')
        expect(tab.badge).toBe('')
        expect(tab.value).toBe('')
        expect(tab.href).toBe(null)
        expect(tab.target).toBe(null)
        expect(tab.navigationScope).toBe('')
        expect(tab.checked).toBe(false)
        expect(tab.defaultChecked).toBe(false)
        expect(tab.required).toBe(false)
        expect(tab.disabled).toBe(false)
        expect(tab.variant).toBe('bar-vertical')
    })

    it('allows updating properties', () => {
        const tab = new MDCNavigationTab()
        tab.label = 'Home'
        tab.badge = '3'
        tab.value = '/home'
        tab.href = '/home'
        tab.target = '_blank'
        tab.navigationScope = 'main'
        tab.checked = true
        tab.defaultChecked = true
        tab.required = true
        tab.disabled = true
        tab.variant = NavigationTabVariant.Drawer

        expect(tab.label).toBe('Home')
        expect(tab.badge).toBe('3')
        expect(tab.value).toBe('/home')
        expect(tab.href).toBe('/home')
        expect(tab.target).toBe('_blank')
        expect(tab.navigationScope).toBe('main')
        expect(tab.checked).toBe(true)
        expect(tab.defaultChecked).toBe(true)
        expect(tab.required).toBe(true)
        expect(tab.disabled).toBe(true)
        expect(tab.variant).toBe('drawer')
    })

    it('throws for an unsupported variant', () => {
        const tab = new MDCNavigationTab()
        tab.variant = 'unsupported' as NavigationTabVariant
        expect(() => (tab as any).willUpdate(new Map())).toThrow(
            '[mdc-navigation-tab] Unsupported variant "unsupported"',
        )
    })

    describe('WAAPI state transitions', () => {
        let calls: IMockAnimationCall[] = []
        let createdAnimations: Animation[] = []
        let reducedMotion = false

        beforeEach(() => {
            calls = []
            createdAnimations = []
            reducedMotion = false

            vi.stubGlobal('window', {
                matchMedia: vi.fn().mockImplementation((query: string) => ({
                    matches: query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
                })),
            })

            vi.stubGlobal('getComputedStyle', vi.fn((el: any) => el?.__mockStyle ?? {}))
        })

        afterEach(() => {
            vi.unstubAllGlobals()
        })

        function setupMotionFixture() {
            const onAnim = (c: IMockAnimationCall) => calls.push(c)
            const container = createMockElement('container', { onAnim, tracker: createdAnimations })
            const indicator = createMockElement('indicator', {
                onAnim,
                tracker: createdAnimations,
                style  : { opacity: '0', transform: 'none', backgroundColor: 'rgb(200, 220, 255)' },
            })
            const iconContainer = createMockElement('iconContainer', { onAnim, tracker: createdAnimations })
            const defaultIcon = createMockElement('defaultIcon', {
                onAnim,
                tracker: createdAnimations,
                style  : { opacity: '1', color: 'rgb(50, 50, 50)' },
            })
            const activeIcon = createMockElement('activeIcon', {
                onAnim,
                tracker: createdAnimations,
                style  : { opacity: '0', color: 'rgb(10, 40, 100)' },
            })
            const inactiveIcon = createMockElement('inactiveIcon', {
                onAnim,
                tracker: createdAnimations,
                style  : { opacity: '1', color: 'rgb(50, 50, 50)' },
            })
            const inLabel = createMockElement('inLabel', {
                onAnim,
                tracker: createdAnimations,
                style  : { color: 'rgb(50, 50, 50)', visibility: 'visible' },
            })
            const outLabel = createMockElement('outLabel', {
                onAnim,
                tracker: createdAnimations,
                style  : { color: 'rgb(50, 50, 50)', visibility: 'visible' },
            })
            const badgeLabel = createMockElement('badgeLabel', { onAnim, tracker: createdAnimations })

            const elements: INavigationTabMotionElements = {
                container,
                indicator,
                iconContainer,
                defaultIcon,
                activeIcon,
                inactiveIcon,
                inLabel,
                outLabel,
                badgeLabel,
            }
            const tracker = new Set<Animation>()
            const baseState: INavigationTabMotionState = {
                checked        : false,
                variant        : NavigationTabVariant.BarVertical,
                disabled       : false,
                badge          : '',
                hasActiveIcon  : false,
                hasInactiveIcon: false,
            }
            return { elements, tracker, baseState }
        }

        it('animates indicator, icon container, and label color when checked changes', () => {
            const { elements, tracker, baseState } = setupMotionFixture()

            const snap1 = captureNavigationTabSnapshot(elements, baseState, {
                checkedChanged : true,
                variantChanged : false,
                disabledChanged: false,
                badgeChanged   : false,
            })
            ;(elements.outLabel as any).__mockStyle.color = 'rgb(10, 40, 100)'
            runNavigationTabTransitions(tracker, elements, { ...baseState, checked: true }, snap1)

            const indicatorCall = calls.find((c) => c.target === elements.indicator)
            const iconCall = calls.find((c) => c.target === elements.iconContainer)
            const labelCall = calls.find((c) => c.target === elements.outLabel)

            expect(indicatorCall).toBeDefined()
            expect(indicatorCall?.keyframes[0]?.['opacity']).toBe(0)
            expect(indicatorCall?.keyframes[1]?.['opacity']).toBe(1)
            expect(iconCall).toBeDefined()
            expect(labelCall).toBeDefined()

            calls = []
            ;(elements.indicator as any).__mockStyle.opacity = '1'
            const snap2 = captureNavigationTabSnapshot(
                elements,
                { ...baseState, checked: true },
                { checkedChanged: true, variantChanged: false, disabledChanged: false, badgeChanged: false },
            )
            runNavigationTabTransitions(tracker, elements, { ...baseState, checked: false }, snap2)

            const collapseCall = calls.find((c) => c.target === elements.indicator)
            expect(collapseCall).toBeDefined()
            expect(collapseCall?.keyframes[1]?.['opacity']).toBe(0)
            expect(collapseCall?.keyframes[0]?.['backgroundColor']).toBe('rgb(200, 220, 255)')
            expect(collapseCall?.keyframes[1]?.['backgroundColor']).toBe('rgb(200, 220, 255)')
        })

        it('cross-fades active and inactive icons when both slots are present', () => {
            const { elements, tracker, baseState } = setupMotionFixture()
            const state: INavigationTabMotionState = {
                ...baseState,
                hasActiveIcon  : true,
                hasInactiveIcon: true,
            }
            const snap = captureNavigationTabSnapshot(elements, state, {
                checkedChanged : true,
                variantChanged : false,
                disabledChanged: false,
                badgeChanged   : false,
            })
            runNavigationTabTransitions(tracker, elements, { ...state, checked: true }, snap)

            const activeCall = calls.find((c) => c.target === elements.activeIcon)
            const inactiveCall = calls.find((c) => c.target === elements.inactiveIcon)
            expect(activeCall?.keyframes[0]?.['opacity']).toBe(0)
            expect(activeCall?.keyframes[1]?.['opacity']).toBe(1)
            expect(inactiveCall?.keyframes[0]?.['opacity']).toBe(1)
            expect(inactiveCall?.keyframes[1]?.['opacity']).toBe(0)
        })

        it('animates indicator, iconContainer, and label with FLIP when variant changes', () => {
            const { elements, tracker, baseState } = setupMotionFixture()
            const prevState: INavigationTabMotionState = {
                ...baseState,
                checked: true,
                variant: NavigationTabVariant.RailVertical,
            }

            vi.spyOn(elements.indicator!, 'getBoundingClientRect')
                .mockReturnValueOnce({ left: 12, top: 4, width: 56, height: 32 } as DOMRect)
                .mockReturnValueOnce({ left: 0, top: 0, width: 200, height: 56 } as DOMRect)
            vi.spyOn(elements.iconContainer!, 'getBoundingClientRect')
                .mockReturnValueOnce({ left: 28, top: 8, width: 24, height: 24 } as DOMRect)
                .mockReturnValueOnce({ left: 16, top: 16, width: 24, height: 24 } as DOMRect)
            vi.spyOn(elements.outLabel!, 'getBoundingClientRect')
                .mockReturnValueOnce({ left: 16, top: 40, width: 48, height: 16 } as DOMRect)
                .mockReturnValueOnce({ left: 48, top: 18, width: 60, height: 20 } as DOMRect)

            const snap = captureNavigationTabSnapshot(elements, prevState, {
                checkedChanged : false,
                variantChanged : true,
                disabledChanged: false,
                badgeChanged   : false,
            })
            runNavigationTabTransitions(
                tracker,
                elements,
                { ...prevState, variant: NavigationTabVariant.RailHorizontal },
                snap,
            )

            expect(calls.some((c) => c.target === elements.indicator)).toBe(true)
            expect(calls.some((c) => c.target === elements.iconContainer)).toBe(true)
            expect(calls.some((c) => c.target === elements.outLabel)).toBe(true)
        })

        it('animates badge-label when badge changes', () => {
            const { elements, tracker, baseState } = setupMotionFixture()
            const snap = captureNavigationTabSnapshot(elements, baseState, {
                checkedChanged : false,
                variantChanged : false,
                disabledChanged: false,
                badgeChanged   : true,
            })
            runNavigationTabTransitions(tracker, elements, { ...baseState, badge: '5' }, snap)

            const badgeCall = calls.find((c) => c.target === elements.badgeLabel)
            expect(badgeCall).toBeDefined()
            expect(badgeCall?.keyframes[0]?.['opacity']).toBe(0)
            expect(badgeCall?.keyframes[1]?.['opacity']).toBe(1)
        })

        it('animates badge-label exit when badge clears and invokes onBadgeExitComplete on finish', () => {
            const { elements, tracker, baseState } = setupMotionFixture()
            const prevState: INavigationTabMotionState = { ...baseState, badge: '3' }
            const snap = captureNavigationTabSnapshot(elements, prevState, {
                checkedChanged : false,
                variantChanged : false,
                disabledChanged: false,
                badgeChanged   : true,
            })

            const onBadgeExitComplete = vi.fn()
            runNavigationTabTransitions(
                tracker,
                elements,
                { ...prevState, badge: '' },
                snap,
                { onBadgeExitComplete },
            )

            const badgeCall = calls.find((c) => c.target === elements.badgeLabel)
            expect(badgeCall).toBeDefined()
            expect(badgeCall?.keyframes[0]?.['opacity']).toBe(1)
            expect(badgeCall?.keyframes[0]?.['transform']).toBe('scale(1)')
            expect(badgeCall?.keyframes[1]?.['opacity']).toBe(0)
            expect(badgeCall?.keyframes[1]?.['transform']).toBe('scale(0.6)')
            expect((badgeCall?.options as KeyframeAnimationOptions | undefined)?.fill).toBe('forwards')
            expect(onBadgeExitComplete).not.toHaveBeenCalled()

            const exitAnim = createdAnimations[createdAnimations.length - 1]
            exitAnim?.finish()
            expect(onBadgeExitComplete).toHaveBeenCalledTimes(1)
        })

        it('animates badge-label subtly when badge updates between non-empty values', () => {
            const { elements, tracker, baseState } = setupMotionFixture()
            const prevState: INavigationTabMotionState = { ...baseState, badge: '3' }
            const snap = captureNavigationTabSnapshot(elements, prevState, {
                checkedChanged : false,
                variantChanged : false,
                disabledChanged: false,
                badgeChanged   : true,
            })

            runNavigationTabTransitions(tracker, elements, { ...prevState, badge: '99+' }, snap)

            const badgeCall = calls.find((c) => c.target === elements.badgeLabel)
            expect(badgeCall).toBeDefined()
            expect(badgeCall?.keyframes[0]?.['opacity']).toBe(0.7)
            expect(badgeCall?.keyframes[0]?.['transform']).toBe('scale(0.85)')
            expect(badgeCall?.keyframes[1]?.['opacity']).toBe(1)
            expect(badgeCall?.keyframes[1]?.['transform']).toBe('scale(1)')
        })

        it('animates color transitions when disabled changes', () => {
            const { elements, tracker, baseState } = setupMotionFixture()
            const prevState: INavigationTabMotionState = { ...baseState, checked: true, disabled: false }
            const snap = captureNavigationTabSnapshot(elements, prevState, {
                checkedChanged : false,
                variantChanged : false,
                disabledChanged: true,
                badgeChanged   : false,
            })
            ;(elements.defaultIcon as any).__mockStyle.color = 'rgb(140, 140, 140)'
            ;(elements.outLabel as any).__mockStyle.color = 'rgb(140, 140, 140)'
            ;(elements.indicator as any).__mockStyle.backgroundColor = 'rgb(220, 220, 220)'
            runNavigationTabTransitions(tracker, elements, { ...prevState, disabled: true }, snap)

            expect(calls.some((c) => c.target === elements.defaultIcon)).toBe(true)
            expect(calls.some((c) => c.target === elements.outLabel)).toBe(true)
            expect(calls.some((c) => c.target === elements.indicator)).toBe(true)
        })

        it('skips WAAPI animations when prefers-reduced-motion is reduce', () => {
            reducedMotion = true
            const { elements, tracker, baseState } = setupMotionFixture()
            const snap = captureNavigationTabSnapshot(elements, baseState, {
                checkedChanged : true,
                variantChanged : false,
                disabledChanged: false,
                badgeChanged   : false,
            })
            runNavigationTabTransitions(tracker, elements, { ...baseState, checked: true }, snap)
            expect(calls.length).toBe(0)
        })

        it('cancels active animations on disconnect', () => {
            const { elements, tracker, baseState } = setupMotionFixture()
            const tab = new TestNavigationTab()
            ;(tab as any).activeAnimations = tracker
            const snap = captureNavigationTabSnapshot(elements, baseState, {
                checkedChanged : true,
                variantChanged : false,
                disabledChanged: false,
                badgeChanged   : false,
            })
            runNavigationTabTransitions(tracker, elements, { ...baseState, checked: true }, snap)
            expect(createdAnimations.length).toBeGreaterThan(0)

            tab.disconnectedCallback()
            for (const anim of createdAnimations) {
                expect(anim.cancel).toHaveBeenCalled()
            }
            expect(tracker.size).toBe(0)
        })
    })
})
